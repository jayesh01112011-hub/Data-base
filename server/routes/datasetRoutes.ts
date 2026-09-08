import { Router } from 'express';
import { db } from '../db';

const router = Router();

// List all active datasets
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let sql = "SELECT * FROM datasets WHERE status != 'disabled'";
  const params: any[] = [];

  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY created_at ASC';

  const rows = db.prepare(sql).all(...params) as any[];
  const datasets = rows.map(r => ({
    ...r,
    schema_fields: JSON.parse(r.schema_fields || '[]')
  }));

  return res.json({ success: true, datasets });
});

// Get dataset by slug
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const dataset = db.prepare('SELECT * FROM datasets WHERE slug = ?').get(slug) as any;

  if (!dataset) {
    return res.status(404).json({ success: false, error: 'Dataset not found' });
  }

  // Fetch 5 sample records
  const sampleRecords = db.prepare(`
    SELECT id, external_id, title, category, location, status, value, currency, deadline, organization, description
    FROM records
    WHERE dataset_id = ?
    LIMIT 5
  `).all(dataset.id);

  return res.json({
    success: true,
    dataset: {
      ...dataset,
      schema_fields: JSON.parse(dataset.schema_fields || '[]'),
      sample_records: sampleRecords
    }
  });
});

export default router;
