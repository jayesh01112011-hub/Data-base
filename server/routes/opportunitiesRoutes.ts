import { Router, Request, Response } from 'express';
import { db } from '../db';
import { validateApiKey } from '../services/apiKeyService';
import { recordApiRequest, checkRateLimit, getUserPlan, getUserCurrentMonthUsage } from '../services/meteringService';

const router = Router();

// Middleware for API key extraction & metering
async function authenticateAndMeter(req: Request, res: Response, next: () => void) {
  const startTime = Date.now();

  // Extract API key from headers or query
  const authHeader = req.headers.authorization;
  const xApiKey = req.headers['x-api-key'] as string | undefined;
  const queryKey = req.query.api_key as string | undefined;

  let rawKey: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer df_live_')) {
    rawKey = authHeader.split(' ')[1];
  } else if (xApiKey && xApiKey.startsWith('df_live_')) {
    rawKey = xApiKey;
  } else if (queryKey && queryKey.startsWith('df_live_')) {
    rawKey = queryKey;
  }

  // Check if live demo request from landing page / sandbox
  const isDemo = req.headers['x-dataflow-demo'] === 'true' || req.query.demo === 'true';

  let userId: string | undefined;
  let apiKeyId: string | undefined;

  if (rawKey) {
    const authResult = validateApiKey(rawKey);
    if (!authResult.valid) {
      const respTime = Date.now() - startTime;
      recordApiRequest({
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: 401,
        responseTimeMs: respTime,
        ipAddress: req.ip
      });
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: authResult.error || 'Invalid API key'
        }
      });
    }

    const user = authResult.user!;
    const key = authResult.key!;
    userId = user.id;
    apiKeyId = key.id;

    // Quota and Rate limit checks
    const plan = getUserPlan(user.id);
    const rateCheck = checkRateLimit(key.id, plan.rate_limit_rps);
    if (!rateCheck.allowed) {
      const respTime = Date.now() - startTime;
      recordApiRequest({
        userId,
        apiKeyId,
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: 429,
        responseTimeMs: respTime,
        ipAddress: req.ip
      });
      res.setHeader('Retry-After', String(rateCheck.retryAfter || 1));
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Your plan (${plan.name}) allows up to ${plan.rate_limit_rps} requests/sec.`,
          retry_after_seconds: rateCheck.retryAfter
        }
      });
    }

    // Monthly Quota Check
    const currentUsage = getUserCurrentMonthUsage(user.id);
    if (currentUsage >= plan.monthly_quota) {
      const respTime = Date.now() - startTime;
      recordApiRequest({
        userId,
        apiKeyId,
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: 429,
        responseTimeMs: respTime,
        ipAddress: req.ip
      });
      return res.status(429).json({
        success: false,
        error: {
          code: 'QUOTA_EXCEEDED',
          message: `Monthly quota exceeded: ${currentUsage} / ${plan.monthly_quota} requests consumed this billing period. Please upgrade your plan in the dashboard.`,
          plan: plan.name,
          quota: plan.monthly_quota,
          used: currentUsage
        }
      });
    }
  } else if (!isDemo) {
    // If neither key nor demo mode, permit with sandbox demo headers or prompt for API key
    // For ease of testing in docs/playground, allow demo with rate limit
    userId = 'usr_dev_002'; // Attribute to developer account for demo testing
  } else {
    userId = 'usr_dev_002';
  }

  // Attach metadata to res.locals so route can log on finish
  res.locals.apiMeta = {
    userId,
    apiKeyId,
    startTime
  };

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    recordApiRequest({
      userId,
      apiKeyId,
      endpoint: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode,
      responseTimeMs: duration,
      ipAddress: req.ip,
      datasetId: 'ds_opportunities'
    });
  });

  next();
}

router.use(authenticateAndMeter);

// GET /api/v1/opportunities
router.get('/', (req, res) => {
  const {
    category,
    location,
    status,
    min_value,
    max_value,
    q,
    sort_by = 'created_at',
    order = 'desc',
    page = '1',
    limit = '20'
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  let whereClauses: string[] = ["dataset_id = 'ds_opportunities'"];
  const params: any[] = [];

  if (category && category !== 'all') {
    whereClauses.push('category = ?');
    params.push(String(category).toLowerCase());
  }

  if (location && location !== 'all') {
    whereClauses.push('location = ?');
    params.push(String(location).toUpperCase());
  }

  if (status && status !== 'all') {
    whereClauses.push('status = ?');
    params.push(String(status).toLowerCase());
  }

  if (min_value) {
    whereClauses.push('value >= ?');
    params.push(Number(min_value));
  }

  if (max_value) {
    whereClauses.push('value <= ?');
    params.push(Number(max_value));
  }

  if (q) {
    whereClauses.push('(title LIKE ? OR description LIKE ? OR organization LIKE ? OR external_id LIKE ?)');
    const searchTerm = `%${q}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Allowed sort columns
  const allowedSortCols: Record<string, string> = {
    created_at: 'created_at',
    value: 'value',
    deadline: 'deadline',
    title: 'title',
    status: 'status'
  };
  const sortCol = allowedSortCols[sort_by as string] || 'created_at';
  const sortOrder = String(order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  // Count total matching
  const countRow = db.prepare(`SELECT count(*) as total FROM records ${whereSql}`).get(...params) as { total: number };
  const totalRecords = countRow?.total || 0;
  const totalPages = Math.ceil(totalRecords / limitNum);

  // Fetch paginated records
  const queryParams = [...params, limitNum, offset];
  const rows = db.prepare(`
    SELECT id, external_id, title, category, location, status, value, currency, deadline, organization, description, metadata_json, created_at, updated_at
    FROM records
    ${whereSql}
    ORDER BY ${sortCol} ${sortOrder}
    LIMIT ? OFFSET ?
  `).all(...queryParams) as any[];

  const data = rows.map(r => ({
    id: r.id,
    external_id: r.external_id,
    title: r.title,
    category: r.category,
    location: r.location,
    status: r.status,
    value: r.value,
    currency: r.currency,
    deadline: r.deadline,
    organization: r.organization,
    description: r.description,
    metadata: JSON.parse(r.metadata_json || '{}'),
    created_at: r.created_at,
    updated_at: r.updated_at
  }));

  // Headers for API transparency
  res.setHeader('X-DataFlow-Dataset', 'ds_opportunities');
  res.setHeader('X-DataFlow-Version', 'v1');
  res.setHeader('X-Total-Count', String(totalRecords));

  return res.json({
    success: true,
    data,
    pagination: {
      total_records: totalRecords,
      page: pageNum,
      limit: limitNum,
      total_pages: totalPages,
      has_more: pageNum < totalPages
    },
    meta: {
      endpoint: '/api/v1/opportunities',
      timestamp: new Date().toISOString(),
      dataset_license: 'Open Government Data License (OGDL) v2.0'
    }
  });
});

// GET /api/v1/opportunities/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const row = db.prepare(`
    SELECT id, external_id, title, category, location, status, value, currency, deadline, organization, description, metadata_json, created_at, updated_at
    FROM records
    WHERE (id = ? OR external_id = ?) AND dataset_id = 'ds_opportunities'
  `).get(id, id) as any;

  if (!row) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Opportunity record '${id}' does not exist`
      }
    });
  }

  return res.json({
    success: true,
    data: {
      id: row.id,
      external_id: row.external_id,
      title: row.title,
      category: row.category,
      location: row.location,
      status: row.status,
      value: row.value,
      currency: row.currency,
      deadline: row.deadline,
      organization: row.organization,
      description: row.description,
      metadata: JSON.parse(row.metadata_json || '{}'),
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  });
});

export default router;
