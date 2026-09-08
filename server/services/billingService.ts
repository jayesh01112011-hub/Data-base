import crypto from 'node:crypto';
import { db } from '../db';

export interface Plan {
  id: string;
  name: string;
  price_inr: number;
  monthly_quota: number;
  rate_limit_rps: number;
  description: string;
  features: string[];
}

export function getAllPlans(): Plan[] {
  const rows = db.prepare('SELECT * FROM plans ORDER BY price_inr ASC').all() as any[];
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    price_inr: r.price_inr,
    monthly_quota: r.monthly_quota,
    rate_limit_rps: r.rate_limit_rps,
    description: r.description,
    features: JSON.parse(r.features_json || '[]')
  }));
}

export function getUserSubscription(userId: string) {
  const sub = db.prepare(`
    SELECT s.*, p.name as plan_name, p.price_inr, p.monthly_quota, p.rate_limit_rps, p.features_json
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.user_id = ?
  `).get(userId) as any;

  const invoices = db.prepare(`
    SELECT * FROM invoices
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 10
  `).all(userId);

  return {
    subscription: sub ? {
      ...sub,
      features: JSON.parse(sub.features_json || '[]')
    } : null,
    invoices
  };
}

export function changeUserPlan(userId: string, newPlanId: string) {
  const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(newPlanId) as any;
  if (!plan) {
    throw new Error('Target plan does not exist');
  }

  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const nowIso = now.toISOString();

  // Update user table
  db.prepare('UPDATE users SET plan_id = ?, updated_at = ? WHERE id = ?').run(newPlanId, nowIso, userId);

  // Update or insert subscription
  db.prepare(`
    INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end)
    VALUES (?, ?, ?, 'active', ?, ?, 0)
    ON CONFLICT(user_id) DO UPDATE SET
      plan_id = ?,
      status = 'active',
      current_period_start = ?,
      current_period_end = ?,
      cancel_at_period_end = 0
  `).run(
    `sub_${crypto.randomBytes(6).toString('hex')}`,
    userId,
    newPlanId,
    nowIso,
    periodEnd,
    newPlanId,
    nowIso,
    periodEnd
  );

  // If paid plan, generate invoice and payment record in mock billing engine
  if (plan.price_inr > 0) {
    const invNum = `INV-${now.getUTCFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceId = `inv_${crypto.randomBytes(6).toString('hex')}`;
    const paymentId = `pay_mock_${crypto.randomBytes(8).toString('hex')}`;

    db.prepare(`
      INSERT INTO invoices (id, user_id, invoice_number, amount_inr, status, billing_period, created_at)
      VALUES (?, ?, ?, ?, 'paid', ?, ?)
    `).run(
      invoiceId,
      userId,
      invNum,
      plan.price_inr,
      now.toLocaleString('default', { month: 'short', year: 'numeric' }),
      nowIso
    );

    db.prepare(`
      INSERT INTO payments (id, user_id, subscription_id, amount_inr, currency, status, provider, provider_payment_id, created_at)
      VALUES (?, ?, ?, ?, 'INR', 'succeeded', 'demo_mock_provider', ?, ?)
    `).run(
      `pay_${crypto.randomBytes(6).toString('hex')}`,
      userId,
      `sub_${userId}`,
      plan.price_inr,
      paymentId,
      nowIso
    );
  }

  return getUserSubscription(userId);
}

export function cancelSubscription(userId: string) {
  const result = db.prepare(`
    UPDATE subscriptions
    SET cancel_at_period_end = 1
    WHERE user_id = ?
  `).run(userId);
  return result.changes > 0;
}
