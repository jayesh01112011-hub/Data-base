export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  plan_id: string;
  plan?: Plan | null;
  subscription?: Subscription | null;
}

export interface Plan {
  id: string;
  name: string;
  price_inr: number;
  monthly_quota: number;
  rate_limit_rps: number;
  description: string;
  features: string[];
}

export interface APIKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: number;
}

export interface Dataset {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  record_count: number;
  update_frequency: string;
  status: 'active' | 'syncing' | 'disabled';
  source_name: string;
  source_license: string;
  api_endpoint: string;
  schema_fields: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  sample_records?: any[];
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  external_id: string;
  title: string;
  category: string;
  location: string;
  status: 'active' | 'evaluating' | 'awarded' | 'closed';
  value: number;
  currency: string;
  deadline: string;
  organization: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UsageSummary {
  plan: Plan;
  todayRequests: number;
  monthRequests: number;
  monthlyQuota: number;
  remainingQuota: number;
  errorRate: number;
  avgResponseTime: number;
  activeKeysCount: number;
}

export interface TimeseriesPoint {
  date: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
}

export interface EndpointMetric {
  endpoint: string;
  count: number;
  avg_latency_ms: number;
  error_count: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name?: string;
  price_inr?: number;
  status: 'active' | 'canceled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: number;
  features?: string[];
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  amount_inr: number;
  status: 'paid' | 'pending';
  billing_period: string;
  created_at: string;
}

export interface IngestionJob {
  id: string;
  dataset_id: string;
  dataset_name?: string;
  status: 'running' | 'completed' | 'failed';
  records_processed: number;
  records_added: number;
  records_updated: number;
  records_failed: number;
  duration_ms: number;
  error_message: string | null;
  triggered_by: string;
  started_at: string;
  completed_at: string | null;
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalRequests: number;
  revenue: number;
  activeSubscriptions: number;
  datasetsCount: number;
  failedIngestionJobs: number;
  apiErrorRate: number;
  systemHealth: string;
  uptimeSeconds: number;
  databaseEngine: string;
}

export interface SystemInfo {
  uptime_seconds: number;
  node_version: string;
  memory_rss_mb: number;
  memory_heap_mb: number;
  scheduler_status: string;
  next_automated_sync_in_seconds: number;
  database: {
    tablesCount: number;
    usersCount: number;
    recordsCount: number;
    requestsCount: number;
    jobsCount: number;
  };
  audit_logs: Array<{
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    created_at: string;
  }>;
}
