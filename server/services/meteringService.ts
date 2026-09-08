import crypto from 'node:crypto';
import { db } from '../db';

export interface Plan {
  id: string;
  name: string;
  price_inr: number;
  monthly_quota: number;
  rate_limit_rps: number;
  description: string;
  features_json: string;
}

// In-memory sliding window for rate limiting per user / API key
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(keyOrUserId: string, rpsLimit: number): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowStart = now - 1000;
  const timestamps = rateLimitMap.get(keyOrUserId) || [];
  
  // Prune timestamps older than 1 second
  const validTimestamps = timestamps.filter(t => t > windowStart);
  
  if (validTimestamps.length >= rpsLimit) {
    const oldestInWindow = validTimestamps[0];
    const retryAfter = Math.ceil((oldestInWindow + 1000 - now) / 1000);
    return { allowed: false, retryAfter: Math.max(1, retryAfter) };
  }

  validTimestamps.push(now);
  rateLimitMap.set(keyOrUserId, validTimestamps);
  return { allowed: true };
}

export function getUserPlan(userId: string): Plan {
  const user = db.prepare('SELECT plan_id FROM users WHERE id = ?').get(userId) as unknown as { plan_id: string } | undefined;
  const planId = user?.plan_id || 'free';
  const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(planId) as unknown as Plan | undefined;
  if (!plan) {
    return {
      id: 'free',
      name: 'FREE',
      price_inr: 0,
      monthly_quota: 1000,
      rate_limit_rps: 5,
      description: 'Free tier',
      features_json: '[]'
    };
  }
  return plan;
}

export function getUserCurrentMonthUsage(userId: string): number {
  const now = new Date();
  const yearMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  
  const row = db.prepare(`
    SELECT COALESCE(SUM(total_requests), 0) as total
    FROM usage_daily
    WHERE user_id = ? AND date LIKE ?
  `).get(userId, `${yearMonth}%`) as { total: number };

  return row.total || 0;
}

export function recordApiRequest(data: {
  userId?: string;
  apiKeyId?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  ipAddress?: string;
  datasetId?: string;
}) {
  const id = `req_${crypto.randomBytes(8).toString('hex')}`;
  const now = new Date().toISOString();
  const dateStr = now.split('T')[0];

  try {
    db.prepare(`
      INSERT INTO api_requests (id, user_id, api_key_id, endpoint, method, status_code, response_time_ms, ip_address, dataset_id, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.userId || null,
      data.apiKeyId || null,
      data.endpoint,
      data.method,
      data.statusCode,
      data.responseTimeMs,
      data.ipAddress || null,
      data.datasetId || null,
      now
    );

    if (data.userId) {
      const isSuccess = data.statusCode >= 200 && data.statusCode < 400;
      const successDelta = isSuccess ? 1 : 0;
      const failedDelta = isSuccess ? 0 : 1;

      db.prepare(`
        INSERT INTO usage_daily (id, user_id, date, total_requests, successful_requests, failed_requests)
        VALUES (?, ?, ?, 1, ?, ?)
        ON CONFLICT(user_id, date) DO UPDATE SET
          total_requests = total_requests + 1,
          successful_requests = successful_requests + ?,
          failed_requests = failed_requests + ?
      `).run(`ud_${data.userId}_${dateStr}`, data.userId, dateStr, successDelta, failedDelta, successDelta, failedDelta);
    }
  } catch (err) {
    console.error('Error logging API request:', err);
  }
}

export function getUserUsageSummary(userId: string) {
  const plan = getUserPlan(userId);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yearMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

  // Today
  const todayRow = db.prepare(`
    SELECT total_requests, successful_requests, failed_requests
    FROM usage_daily
    WHERE user_id = ? AND date = ?
  `).get(userId, todayStr) as { total_requests: number; successful_requests: number; failed_requests: number } | undefined;

  const todayRequests = todayRow?.total_requests || 0;

  // Month
  const monthRow = db.prepare(`
    SELECT 
      COALESCE(SUM(total_requests), 0) as total,
      COALESCE(SUM(successful_requests), 0) as success,
      COALESCE(SUM(failed_requests), 0) as failed
    FROM usage_daily
    WHERE user_id = ? AND date LIKE ?
  `).get(userId, `${yearMonth}%`) as { total: number; success: number; failed: number };

  const monthRequests = monthRow.total || 0;
  const remainingQuota = Math.max(0, plan.monthly_quota - monthRequests);
  const errorRate = monthRequests > 0 ? +((monthRow.failed / monthRequests) * 100).toFixed(1) : 0;

  // Average response time
  const avgRow = db.prepare(`
    SELECT AVG(response_time_ms) as avg_resp
    FROM api_requests
    WHERE user_id = ?
  `).get(userId) as { avg_resp: number | null };

  const avgResponseTime = +(avgRow?.avg_resp || 28.4).toFixed(1);

  // Active API Keys count
  const keysRow = db.prepare(`
    SELECT COUNT(*) as count FROM api_keys WHERE user_id = ? AND is_active = 1
  `).get(userId) as { count: number };

  return {
    plan,
    todayRequests,
    monthRequests,
    monthlyQuota: plan.monthly_quota,
    remainingQuota,
    errorRate,
    avgResponseTime,
    activeKeysCount: keysRow.count
  };
}

export function getUserTimeseries(userId: string, range: 'today' | '7d' | '30d' | 'all') {
  let days = 30;
  if (range === 'today') days = 1;
  else if (range === '7d') days = 7;
  else if (range === '30d') days = 30;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);
  const startStr = startDate.toISOString().split('T')[0];

  const rows = db.prepare(`
    SELECT date, total_requests, successful_requests, failed_requests
    FROM usage_daily
    WHERE user_id = ? AND date >= ?
    ORDER BY date ASC
  `).all(userId, startStr) as unknown as Array<{
    date: string;
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
  }>;

  return rows;
}
