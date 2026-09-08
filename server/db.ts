import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'dataflow.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode for performance
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
} catch (e) {
  console.warn('WAL pragma warning:', e);
}

export function initDatabase() {
  // 1. Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'active',
      plan_id TEXT NOT NULL DEFAULT 'free',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 2. API Keys
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      key_prefix TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_used_at TEXT,
      expires_at TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 3. Datasets
  db.exec(`
    CREATE TABLE IF NOT EXISTS datasets (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      record_count INTEGER NOT NULL DEFAULT 0,
      update_frequency TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      source_name TEXT NOT NULL,
      source_license TEXT NOT NULL,
      api_endpoint TEXT NOT NULL,
      schema_fields TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 4. Records (Opportunities dataset for MVP)
  db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      dataset_id TEXT NOT NULL,
      external_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      value REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD',
      deadline TEXT,
      organization TEXT NOT NULL,
      description TEXT NOT NULL,
      metadata_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_records_dataset ON records(dataset_id);
    CREATE INDEX IF NOT EXISTS idx_records_category ON records(category);
    CREATE INDEX IF NOT EXISTS idx_records_location ON records(location);
    CREATE INDEX IF NOT EXISTS idx_records_status ON records(status);
  `);

  // 5. API Requests
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      api_key_id TEXT,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL DEFAULT 'GET',
      status_code INTEGER NOT NULL,
      response_time_ms REAL NOT NULL,
      ip_address TEXT,
      dataset_id TEXT,
      timestamp TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_api_requests_user ON api_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_api_requests_timestamp ON api_requests(timestamp);
  `);

  // 6. Usage Daily
  db.exec(`
    CREATE TABLE IF NOT EXISTS usage_daily (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      total_requests INTEGER NOT NULL DEFAULT 0,
      successful_requests INTEGER NOT NULL DEFAULT 0,
      failed_requests INTEGER NOT NULL DEFAULT 0,
      UNIQUE(user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 7. Plans
  db.exec(`
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price_inr INTEGER NOT NULL,
      monthly_quota INTEGER NOT NULL,
      rate_limit_rps INTEGER NOT NULL,
      description TEXT NOT NULL,
      features_json TEXT NOT NULL
    );
  `);

  // 8. Subscriptions
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      plan_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      current_period_start TEXT NOT NULL,
      current_period_end TEXT NOT NULL,
      cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES plans(id)
    );
  `);

  // 9. Payments
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subscription_id TEXT,
      amount_inr INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'succeeded',
      provider TEXT NOT NULL DEFAULT 'demo_provider',
      provider_payment_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 10. Invoices
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      invoice_number TEXT NOT NULL UNIQUE,
      amount_inr INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'paid',
      billing_period TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 11. Ingestion Jobs
  db.exec(`
    CREATE TABLE IF NOT EXISTS ingestion_jobs (
      id TEXT PRIMARY KEY,
      dataset_id TEXT NOT NULL,
      status TEXT NOT NULL, -- 'running' | 'completed' | 'failed'
      records_processed INTEGER NOT NULL DEFAULT 0,
      records_added INTEGER NOT NULL DEFAULT 0,
      records_updated INTEGER NOT NULL DEFAULT 0,
      records_failed INTEGER NOT NULL DEFAULT 0,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      error_message TEXT,
      triggered_by TEXT NOT NULL DEFAULT 'automated',
      started_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
    );
  `);

  // 12. Audit Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details_json TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );
  `);

  seedInitialData();
}

function hashPassword(password: string): string {
  const salt = 'df_salt_2026_production';
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function seedInitialData() {
  // Check if plans exist
  const planCount = db.prepare('SELECT count(*) as count FROM plans').get() as { count: number };
  if (planCount.count === 0) {
    const plans = [
      {
        id: 'free',
        name: 'FREE',
        price_inr: 0,
        monthly_quota: 1000,
        rate_limit_rps: 5,
        description: 'Perfect for testing, personal experiments, and hobbyist projects.',
        features: [
          '1,000 requests/month',
          '5 requests/sec rate limit',
          'Access to core public datasets',
          'Standard community support',
          'Basic API analytics'
        ]
      },
      {
        id: 'developer',
        name: 'DEVELOPER',
        price_inr: 499,
        monthly_quota: 25000,
        rate_limit_rps: 20,
        description: 'Ideal for independent developers, prototypes, and production micro-services.',
        features: [
          '25,000 requests/month',
          '20 requests/sec rate limit',
          'Access to all public & open datasets',
          'Email support (24h response)',
          'Automated daily ingestion feeds',
          'Detailed endpoint usage analytics'
        ]
      },
      {
        id: 'growth',
        name: 'GROWTH',
        price_inr: 1499,
        monthly_quota: 100000,
        rate_limit_rps: 60,
        description: 'Built for scaling startups and data-intensive applications.',
        features: [
          '100,000 requests/month',
          '60 requests/sec rate limit',
          'All datasets + priority real-time sync',
          'Priority email & Slack support',
          'CSV usage exports & webhooks',
          'Custom dataset filter parameters',
          '99.9% uptime SLA'
        ]
      },
      {
        id: 'business',
        name: 'BUSINESS',
        price_inr: 4999,
        monthly_quota: 500000,
        rate_limit_rps: 200,
        description: 'High throughput, compliance-ready enterprise data pipelines.',
        features: [
          '500,000 requests/month',
          '200 requests/sec rate limit',
          'Dedicated ingestion worker pipelines',
          'Dedicated account manager',
          'Custom batch ingestion triggers',
          'Multi-region failover & 99.99% SLA',
          'Custom licensed dataset agreements'
        ]
      }
    ];

    const insertPlan = db.prepare(`
      INSERT INTO plans (id, name, price_inr, monthly_quota, rate_limit_rps, description, features_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of plans) {
      insertPlan.run(p.id, p.name, p.price_inr, p.monthly_quota, p.rate_limit_rps, p.description, JSON.stringify(p.features));
    }
  }

  // Seed Users
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const now = new Date().toISOString();
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, status, plan_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertSub = db.prepare(`
      INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. Admin User
    const adminId = 'usr_admin_001';
    insertUser.run(
      adminId,
      'DataFlow Admin',
      'admin@dataflow.dev',
      hashPassword('Admin@DataFlow2026!'),
      'admin',
      'active',
      'business',
      now,
      now
    );
    insertSub.run('sub_admin_001', adminId, 'business', 'active', now, periodEnd, 0);

    // 2. Demo Developer User (starts on Growth plan to show real usage graphs)
    const devId = 'usr_dev_002';
    insertUser.run(
      devId,
      'Alex Vance',
      'developer@company.com',
      hashPassword('DevPass123!'),
      'user',
      'active',
      'growth',
      now,
      now
    );
    insertSub.run('sub_dev_002', devId, 'growth', 'active', now, periodEnd, 0);

    // Create live API keys for demo developer
    const insertKey = db.prepare(`
      INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix, created_at, last_used_at, expires_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Key 1: Production Live Key
    const rawKey1 = 'df_live_9a4f78e1c2d3b4a56789abcdef012345';
    insertKey.run('key_live_001', devId, 'Production Backend App', hashApiKey(rawKey1), 'df_live_9a4f...', now, now, null, 1);

    // Key 2: Staging Key
    const rawKey2 = 'df_live_3b8e21c9d4f5a6071829bcde3456789a';
    insertKey.run('key_live_002', devId, 'Staging / CI Test Suite', hashApiKey(rawKey2), 'df_live_3b8e...', now, now, null, 1);

    // Key 3: Mobile Service Key
    const rawKey3 = 'df_live_7c1d45f8a9e0b2345678cdef90123456';
    insertKey.run('key_live_003', devId, 'Analytics Microservice', hashApiKey(rawKey3), 'df_live_7c1d...', now, now, null, 1);

    // Invoices for Developer
    const insertInvoice = db.prepare(`
      INSERT INTO invoices (id, user_id, invoice_number, amount_inr, status, billing_period, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertInvoice.run('inv_101', devId, 'INV-2026-0891', 1499, 'paid', 'Aug 2026', '2026-08-01T00:00:00Z');
    insertInvoice.run('inv_102', devId, 'INV-2026-0944', 1499, 'paid', 'Sep 2026', '2026-09-01T00:00:00Z');

    const insertPayment = db.prepare(`
      INSERT INTO payments (id, user_id, subscription_id, amount_inr, currency, status, provider, provider_payment_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertPayment.run('pay_001', devId, 'sub_dev_002', 1499, 'INR', 'succeeded', 'demo_mock', 'pay_mock_98234710', '2026-08-01T00:00:00Z');
    insertPayment.run('pay_002', devId, 'sub_dev_002', 1499, 'INR', 'succeeded', 'demo_mock', 'pay_mock_98234711', '2026-09-01T00:00:00Z');
  }

  // Seed Datasets
  const datasetCount = db.prepare('SELECT count(*) as count FROM datasets').get() as { count: number };
  if (datasetCount.count === 0) {
    const now = new Date().toISOString();
    const insertDataset = db.prepare(`
      INSERT INTO datasets (id, slug, name, description, category, record_count, update_frequency, status, source_name, source_license, api_endpoint, schema_fields, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const datasets = [
      {
        id: 'ds_opportunities',
        slug: 'opportunities',
        name: 'Global Public Opportunities & Procurement',
        description: 'Structured public procurement tenders, government RFPs, infrastructure contracts, and innovation grants worldwide.',
        category: 'Procurement',
        record_count: 148,
        update_frequency: 'Every 15 minutes',
        status: 'active',
        source_name: 'Open Contracting Data Standard (OCDS) & Official Public Portals',
        source_license: 'Open Government Data License (OGDL) v2.0 / Public Domain',
        api_endpoint: '/api/v1/opportunities',
        schema_fields: JSON.stringify([
          { name: 'id', type: 'string', description: 'Unique opportunity identifier' },
          { name: 'title', type: 'string', description: 'Title or summary of opportunity' },
          { name: 'category', type: 'string', description: 'Industry category (e.g. manufacturing, healthcare, technology)' },
          { name: 'location', type: 'string', description: 'Country/state code or region' },
          { name: 'status', type: 'string', description: 'Current status (active, evaluating, awarded, closed)' },
          { name: 'value', type: 'number', description: 'Estimated contract value in USD' },
          { name: 'organization', type: 'string', description: 'Issuing agency or authority' },
          { name: 'deadline', type: 'string', description: 'Submission deadline ISO 8601' }
        ])
      },
      {
        id: 'ds_corporate_registrations',
        slug: 'corporate-entities',
        name: 'Global Corporate Registrations & Identifiers',
        description: 'Verified public legal entities, business registries, LEI records, and official jurisdiction filings.',
        category: 'Business',
        record_count: 8940,
        update_frequency: 'Hourly',
        status: 'active',
        source_name: 'Global LEI Foundation (GLEIF) & National Registrars',
        source_license: 'Creative Commons CC0 1.0 Universal',
        api_endpoint: '/api/v1/entities',
        schema_fields: JSON.stringify([
          { name: 'id', type: 'string', description: 'Entity LEI or registration code' },
          { name: 'legal_name', type: 'string', description: 'Registered legal entity name' },
          { name: 'jurisdiction', type: 'string', description: 'Country or sub-division' },
          { name: 'entity_status', type: 'string', description: 'Active, inactive, dissolved' },
          { name: 'incorporation_date', type: 'string', description: 'ISO date of registration' }
        ])
      },
      {
        id: 'ds_environmental',
        slug: 'environmental-monitoring',
        name: 'Public Environmental Sensor & Emissions Data',
        description: 'Standardized ambient air quality, grid carbon intensity, and environmental compliance sensor records.',
        category: 'Environmental',
        record_count: 42100,
        update_frequency: 'Every 5 minutes',
        status: 'active',
        source_name: 'OpenAQ Network & Meteorological Public Feeds',
        source_license: 'Open Data Commons Open Database License (ODbL)',
        api_endpoint: '/api/v1/environmental',
        schema_fields: JSON.stringify([
          { name: 'sensor_id', type: 'string', description: 'Station unique sensor identifier' },
          { name: 'metric', type: 'string', description: 'PM2.5, PM10, NO2, CO2 intensity' },
          { name: 'value', type: 'number', description: 'Observed reading' },
          { name: 'unit', type: 'string', description: 'Measurement unit' },
          { name: 'coordinates', type: 'object', description: 'Latitude and longitude' }
        ])
      },
      {
        id: 'ds_patents',
        slug: 'open-patents',
        name: 'Public Intellectual Property & Patent Filings',
        description: 'Public domain international patent classifications, filing status, applicants, and publication notices.',
        category: 'Intellectual Property',
        record_count: 15600,
        update_frequency: 'Daily',
        status: 'active',
        source_name: 'World Intellectual Property Organization (WIPO) Public Data',
        source_license: 'Public Domain / Free for Commercial Redistribution',
        api_endpoint: '/api/v1/patents',
        schema_fields: JSON.stringify([
          { name: 'filing_number', type: 'string', description: 'Application / Grant number' },
          { name: 'title', type: 'string', description: 'Patent invention title' },
          { name: 'applicant', type: 'string', description: 'Assignee / applicant name' },
          { name: 'ipc_class', type: 'string', description: 'International classification' }
        ])
      }
    ];

    for (const d of datasets) {
      insertDataset.run(
        d.id,
        d.slug,
        d.name,
        d.description,
        d.category,
        d.record_count,
        d.update_frequency,
        d.status,
        d.source_name,
        d.source_license,
        d.api_endpoint,
        d.schema_fields,
        now,
        now
      );
    }

    // Seed Opportunities Records
    seedOpportunitiesRecords();
    // Seed Sample Ingestion Jobs
    seedIngestionJobs();
    // Seed Realistic Usage and API Requests for Alex Vance
    seedUsageMetrics();
  }
}

function seedOpportunitiesRecords() {
  const categories = [
    'manufacturing',
    'infrastructure',
    'technology',
    'healthcare',
    'clean-energy',
    'cybersecurity',
    'logistics',
    'aerospace'
  ];

  const locations = [
    'US-CA', 'US-TX', 'US-NY', 'US-WA',
    'DE-BER', 'FR-IDF', 'UK-LON', 'NL-AMS',
    'IN-MH', 'IN-KA', 'IN-DL', 'JP-TOK',
    'SG-SIN', 'AU-NSW', 'CA-ON'
  ];

  const orgs = [
    'Department of Transportation & Modern Transit',
    'State Energy Development Agency',
    'Federal Health & Clinical Research Council',
    'Smart Urban Development Authority',
    'Advanced Manufacturing Consortium',
    'Defense Innovation Unit',
    'Public Grid Infrastructure Agency',
    'National Cloud & AI Advisory Board',
    'Clean Waterway Restoration Trust',
    'Port & Supply Chain Maritime Authority'
  ];

  const opportunities = [
    {
      title: 'Precision CNC & Advanced Aerospace Component Fabrication',
      category: 'manufacturing',
      location: 'US-CA',
      value: 14500000,
      org: 'Defense Innovation Unit',
      status: 'active'
    },
    {
      title: 'Automated Microgrid & Battery Storage Infrastructure Phase III',
      category: 'clean-energy',
      location: 'DE-BER',
      value: 38200000,
      org: 'State Energy Development Agency',
      status: 'active'
    },
    {
      title: 'Distributed Smart Traffic & Telemetry Sensor Network',
      category: 'infrastructure',
      location: 'UK-LON',
      value: 8400000,
      org: 'Smart Urban Development Authority',
      status: 'active'
    },
    {
      title: 'Next-Gen Clinical Genomics Processing & Cloud Pipeline',
      category: 'healthcare',
      location: 'US-WA',
      value: 12100000,
      org: 'Federal Health & Clinical Research Council',
      status: 'active'
    },
    {
      title: 'High-Throughput Semiconductor Metrology & Tooling',
      category: 'manufacturing',
      location: 'JP-TOK',
      value: 52000000,
      org: 'Advanced Manufacturing Consortium',
      status: 'active'
    },
    {
      title: 'Autonomous Port Container Logistics & Dispatch System',
      category: 'logistics',
      location: 'NL-AMS',
      value: 29000000,
      org: 'Port & Supply Chain Maritime Authority',
      status: 'active'
    },
    {
      title: 'Zero-Trust Enterprise Identity & Defense Perimeter Upgrade',
      category: 'cybersecurity',
      location: 'US-TX',
      value: 16800000,
      org: 'Defense Innovation Unit',
      status: 'evaluating'
    },
    {
      title: 'Sovereign AI Compute Cluster & Distributed Training Fabric',
      category: 'technology',
      location: 'FR-IDF',
      value: 65000000,
      org: 'National Cloud & AI Advisory Board',
      status: 'active'
    },
    {
      title: 'Municipal Ultra-Filtration & Industrial Wastewater Treatment',
      category: 'infrastructure',
      location: 'IN-MH',
      value: 22500000,
      org: 'Clean Waterway Restoration Trust',
      status: 'active'
    },
    {
      title: 'High-Speed Rail Signaling & Automatic Train Control',
      category: 'infrastructure',
      location: 'IN-DL',
      value: 88000000,
      org: 'Department of Transportation & Modern Transit',
      status: 'active'
    },
    {
      title: 'Offshore Floating Wind Turbine Structural Monitoring Systems',
      category: 'clean-energy',
      location: 'UK-LON',
      value: 41000000,
      org: 'State Energy Development Agency',
      status: 'active'
    },
    {
      title: 'Robotic Welding Automation for Heavy Freight Wagons',
      category: 'manufacturing',
      location: 'US-TX',
      value: 9300000,
      org: 'Advanced Manufacturing Consortium',
      status: 'active'
    },
    {
      title: 'Hospital Biometric Patient Tracking & Asset Telemetry',
      category: 'healthcare',
      location: 'SG-SIN',
      value: 7400000,
      org: 'Federal Health & Clinical Research Council',
      status: 'awarded'
    },
    {
      title: 'Deep Satellite Imagery Ingestion for Crop Yield Forecasting',
      category: 'technology',
      location: 'CA-ON',
      value: 15200000,
      org: 'National Cloud & AI Advisory Board',
      status: 'active'
    },
    {
      title: 'Subsea Fiber Cable Landing Station Critical Power Backup',
      category: 'technology',
      location: 'AU-NSW',
      value: 34000000,
      org: 'Smart Urban Development Authority',
      status: 'active'
    }
  ];

  // Add remaining to reach 148 realistic items
  const now = new Date();
  const insertRecord = db.prepare(`
    INSERT INTO records (id, dataset_id, external_id, title, category, location, status, value, currency, deadline, organization, description, metadata_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < 148; i++) {
    const base = opportunities[i % opportunities.length];
    const cat = categories[i % categories.length];
    const loc = locations[i % locations.length];
    const org = orgs[i % orgs.length];
    const recId = `opp_${String(i + 1).padStart(4, '0')}`;
    const extId = `GOV-${2026}-${String(1000 + i)}`;
    const title = i < opportunities.length 
      ? base.title 
      : `${base.title} (Batch #${Math.floor(i / 10) + 1} - Area ${loc})`;
    const status = i % 11 === 0 ? 'evaluating' : i % 17 === 0 ? 'awarded' : 'active';
    const value = Math.round((base.value * (0.6 + ((i * 37) % 100) / 100)) / 10000) * 10000;
    const deadline = new Date(now.getTime() + (10 + (i % 60)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const desc = `Competitive solicitation for ${title.toLowerCase()} adhering to international open standards. Open to qualified contractors and certified consortiums.`;
    const meta = JSON.stringify({
      procurement_method: 'open_competitive',
      tender_classification: cat,
      submission_format: 'digital_json',
      compliance_tier: 'T1_GOV_VERIFIED',
      estimated_delivery_months: 18 + (i % 24)
    });

    insertRecord.run(
      recId,
      'ds_opportunities',
      extId,
      title,
      cat,
      loc,
      status,
      value,
      'USD',
      deadline,
      org,
      desc,
      meta,
      now.toISOString(),
      now.toISOString()
    );
  }
}

function seedIngestionJobs() {
  const insertJob = db.prepare(`
    INSERT INTO ingestion_jobs (id, dataset_id, status, records_processed, records_added, records_updated, records_failed, duration_ms, error_message, triggered_by, started_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Date.now();
  const jobs = [
    {
      id: 'job_101',
      dataset: 'ds_opportunities',
      status: 'completed',
      processed: 148,
      added: 24,
      updated: 124,
      failed: 0,
      duration: 3420,
      error: null,
      trigger: 'cron_scheduler',
      started: new Date(now - 15 * 60 * 1000).toISOString(),
      completed: new Date(now - 14 * 60 * 1000).toISOString()
    },
    {
      id: 'job_102',
      dataset: 'ds_environmental',
      status: 'completed',
      processed: 1250,
      added: 1250,
      updated: 0,
      failed: 0,
      duration: 1850,
      error: null,
      trigger: 'cron_scheduler',
      started: new Date(now - 30 * 60 * 1000).toISOString(),
      completed: new Date(now - 29 * 60 * 1000).toISOString()
    },
    {
      id: 'job_103',
      dataset: 'ds_corporate_registrations',
      status: 'completed',
      processed: 450,
      added: 35,
      updated: 415,
      failed: 0,
      duration: 4120,
      error: null,
      trigger: 'manual_admin',
      started: new Date(now - 3 * 3600 * 1000).toISOString(),
      completed: new Date(now - 3 * 3600 * 1000 + 4120).toISOString()
    },
    {
      id: 'job_104',
      dataset: 'ds_patents',
      status: 'failed',
      processed: 120,
      added: 0,
      updated: 0,
      failed: 120,
      duration: 1200,
      error: 'Upstream HTTP 429: Rate limit exceeded on remote WIPO mirror. Pipeline auto-retrying in 15m.',
      trigger: 'cron_scheduler',
      started: new Date(now - 6 * 3600 * 1000).toISOString(),
      completed: new Date(now - 6 * 3600 * 1000 + 1200).toISOString()
    }
  ];

  for (const j of jobs) {
    insertJob.run(
      j.id,
      j.dataset,
      j.status,
      j.processed,
      j.added,
      j.updated,
      j.failed,
      j.duration,
      j.error,
      j.trigger,
      j.started,
      j.completed
    );
  }
}

function seedUsageMetrics() {
  const devId = 'usr_dev_002';
  const keyId = 'key_live_001';

  // Seed daily usage for the past 30 days to populate real graphs
  const insertDaily = db.prepare(`
    INSERT OR REPLACE INTO usage_daily (id, user_id, date, total_requests, successful_requests, failed_requests)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertReq = db.prepare(`
    INSERT INTO api_requests (id, user_id, api_key_id, endpoint, method, status_code, response_time_ms, ip_address, dataset_id, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const today = new Date();
  let accumulatedMonth = 0;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // realistic bell curve + growth curve
    const dayFactor = 650 + Math.sin(i / 4) * 200 + ((30 - i) * 18) + (Math.random() * 80);
    const total = Math.round(dayFactor);
    const failed = Math.round(total * (0.008 + Math.random() * 0.008)); // ~1.2% errors
    const success = total - failed;

    accumulatedMonth += total;

    insertDaily.run(`ud_${devId}_${dateStr}`, devId, dateStr, total, success, failed);
  }

  // Seed recent 40 individual request logs for live drilldown
  const endpoints = [
    '/api/v1/opportunities',
    '/api/v1/opportunities?category=manufacturing',
    '/api/v1/opportunities?category=clean-energy',
    '/api/v1/opportunities/opp_0001',
    '/api/v1/opportunities?location=US-CA',
    '/api/v1/opportunities?status=active&limit=10'
  ];

  for (let j = 0; j < 45; j++) {
    const timeOffset = (45 - j) * 45 * 1000; // past 30-40 minutes
    const ts = new Date(Date.now() - timeOffset).toISOString();
    const ep = endpoints[j % endpoints.length];
    const isErr = j === 14;
    const statusCode = isErr ? 429 : 200;
    const respTime = isErr ? 12.4 : +(18 + Math.random() * 32).toFixed(1);

    insertReq.run(
      `req_${String(j + 1).padStart(4, '0')}`,
      devId,
      keyId,
      ep,
      'GET',
      statusCode,
      respTime,
      '198.51.100.' + (10 + (j % 50)),
      'ds_opportunities',
      ts
    );
  }
}
