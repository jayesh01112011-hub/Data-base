import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { getUserUsageSummary, getUserTimeseries } from '../services/meteringService';
import { db } from '../db';

const router = Router();
router.use(requireAuth);

router.get('/summary', (req: AuthenticatedRequest, res) => {
  const summary = getUserUsageSummary(req.user!.id);
  return res.json({ success: true, summary });
});

router.get('/timeseries', (req: AuthenticatedRequest, res) => {
  const range = (req.query.range as any) || '30d';
  const timeseries = getUserTimeseries(req.user!.id, range);
  return res.json({ success: true, timeseries });
});

router.get('/endpoints', (req: AuthenticatedRequest, res) => {
  const rows = db.prepare(`
    SELECT endpoint, COUNT(*) as count, AVG(response_time_ms) as avg_latency,
           SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as errors
    FROM api_requests
    WHERE user_id = ?
    GROUP BY endpoint
    ORDER BY count DESC
    LIMIT 10
  `).all(req.user!.id) as any[];

  const endpoints = rows.map(r => ({
    endpoint: r.endpoint,
    count: r.count,
    avg_latency_ms: +(r.avg_latency || 0).toFixed(1),
    error_count: r.errors
  }));

  return res.json({ success: true, endpoints });
});

router.get('/recent-requests', (req: AuthenticatedRequest, res) => {
  const rows = db.prepare(`
    SELECT r.id, r.endpoint, r.method, r.status_code, r.response_time_ms, r.timestamp, k.name as key_name
    FROM api_requests r
    LEFT JOIN api_keys k ON r.api_key_id = k.id
    WHERE r.user_id = ?
    ORDER BY r.timestamp DESC
    LIMIT 30
  `).all(req.user!.id);

  return res.json({ success: true, requests: rows });
});

router.get('/export-csv', (req: AuthenticatedRequest, res) => {
  const rows = db.prepare(`
    SELECT r.id, r.timestamp, r.method, r.endpoint, r.status_code, r.response_time_ms, k.name as api_key
    FROM api_requests r
    LEFT JOIN api_keys k ON r.api_key_id = k.id
    WHERE r.user_id = ?
    ORDER BY r.timestamp DESC
    LIMIT 1000
  `).all(req.user!.id) as any[];

  let csv = 'Request ID,Timestamp,Method,Endpoint,Status Code,Response Time (ms),API Key\n';
  for (const r of rows) {
    csv += `"${r.id}","${r.timestamp}","${r.method}","${r.endpoint.replace(/"/g, '""')}",${r.status_code},${r.response_time_ms},"${(r.api_key || 'Direct/Demo').replace(/"/g, '""')}"\n`;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="dataflow-usage-${new Date().toISOString().split('T')[0]}.csv"`);
  return res.send(csv);
});

export default router;
