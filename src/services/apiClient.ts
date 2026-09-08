import { Dataset, Opportunity, Plan, Subscription, UsageSummary, TimeseriesPoint, EndpointMetric, AdminMetrics, SystemInfo, APIKey, IngestionJob } from '../types';

const TOKEN_KEY = 'dataflow_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error?.message || data.error || `HTTP error ${res.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    login: (email: string, password: string) => request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
    register: (name: string, email: string, password: string, confirmPassword: string) => request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword })
    }),
    me: () => request('/api/auth/me'),
    changePassword: (currentPassword: string, newPassword: string) => request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    }),
    demoLogin: (type: 'admin' | 'developer') => request('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ type })
    })
  },

  // API Keys
  apiKeys: {
    list: () => request<{ success: boolean; keys: APIKey[] }>('/api/api-keys'),
    create: (name: string, expiresInDays?: number) => request<{
      success: boolean;
      key: APIKey;
      secretKey: string;
      warning: string;
    }>('/api/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name, expiresInDays })
    }),
    revoke: (id: string) => request(`/api/api-keys/${id}/revoke`, { method: 'POST' }),
    delete: (id: string) => request(`/api/api-keys/${id}`, { method: 'DELETE' })
  },

  // Datasets
  datasets: {
    list: (category?: string, search?: string) => {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.set('category', category);
      if (search) params.set('search', search);
      return request<{ success: boolean; datasets: Dataset[] }>(`/api/datasets?${params.toString()}`);
    },
    getBySlug: (slug: string) => request<{ success: boolean; dataset: Dataset }>(`/api/datasets/${slug}`)
  },

  // Opportunities API (Client demo & testing)
  opportunities: {
    query: (params: {
      category?: string;
      location?: string;
      status?: string;
      page?: number;
      limit?: number;
      q?: string;
      sort_by?: string;
      order?: string;
      apiKey?: string;
    }) => {
      const query = new URLSearchParams();
      if (params.category && params.category !== 'all') query.set('category', params.category);
      if (params.location && params.location !== 'all') query.set('location', params.location);
      if (params.status && params.status !== 'all') query.set('status', params.status);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      if (params.q) query.set('q', params.q);
      if (params.sort_by) query.set('sort_by', params.sort_by);
      if (params.order) query.set('order', params.order);

      const headers: Record<string, string> = {
        'x-dataflow-demo': 'true'
      };
      if (params.apiKey) {
        headers['x-api-key'] = params.apiKey;
      }

      return request<{
        success: boolean;
        data: Opportunity[];
        pagination: {
          total_records: number;
          page: number;
          limit: number;
          total_pages: number;
          has_more: boolean;
        };
        meta: any;
      }>(`/api/v1/opportunities?${query.toString()}`, { headers });
    },
    getById: (id: string, apiKey?: string) => {
      const headers: Record<string, string> = { 'x-dataflow-demo': 'true' };
      if (apiKey) headers['x-api-key'] = apiKey;
      return request<{ success: boolean; data: Opportunity }>(`/api/v1/opportunities/${id}`, { headers });
    }
  },

  // Usage & Metering
  usage: {
    getSummary: () => request<{ success: boolean; summary: UsageSummary }>('/api/usage/summary'),
    getTimeseries: (range: 'today' | '7d' | '30d' | 'all') =>
      request<{ success: boolean; timeseries: TimeseriesPoint[] }>(`/api/usage/timeseries?range=${range}`),
    getEndpoints: () => request<{ success: boolean; endpoints: EndpointMetric[] }>('/api/usage/endpoints'),
    getRecentRequests: () => request<{ success: boolean; requests: any[] }>('/api/usage/recent-requests'),
    exportCsvUrl: '/api/usage/export-csv'
  },

  // Billing
  billing: {
    getPlans: () => request<{ success: boolean; plans: Plan[] }>('/api/billing/plans'),
    getSubscription: () => request<{ success: boolean; subscription: Subscription; invoices: any[] }>('/api/billing/subscription'),
    changePlan: (planId: string) => request('/api/billing/change-plan', {
      method: 'POST',
      body: JSON.stringify({ planId })
    }),
    cancelSubscription: () => request('/api/billing/cancel-subscription', { method: 'POST' }),
    simulateWebhook: (eventType: string, data: any) => request('/api/billing/simulate-webhook', {
      method: 'POST',
      body: JSON.stringify({ event_type: eventType, data })
    })
  },

  // Admin
  admin: {
    getMetrics: () => request<{ success: boolean; metrics: AdminMetrics }>('/api/admin/metrics'),
    getUsers: (search?: string, role?: string, status?: string) => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (role) params.set('role', role);
      if (status) params.set('status', status);
      return request<{ success: boolean; users: any[] }>(`/api/admin/users?${params.toString()}`);
    },
    updateUserStatus: (id: string, data: { status?: string; role?: string }) =>
      request(`/api/admin/users/${id}/status`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getDatasets: () => request<{ success: boolean; datasets: Dataset[] }>('/api/admin/datasets'),
    createDataset: (payload: Partial<Dataset>) => request('/api/admin/datasets', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    editDataset: (id: string, payload: Partial<Dataset>) => request(`/api/admin/datasets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
    toggleDataset: (id: string) => request(`/api/admin/datasets/${id}/toggle`, { method: 'POST' }),
    triggerIngestion: (datasetId: string) => request<{
      success: boolean;
      message: string;
      job: IngestionJob;
      pipeline_logs: any[];
    }>(`/api/admin/datasets/${datasetId}/ingest`, { method: 'POST' }),
    getIngestionJobs: () => request<{ success: boolean; jobs: IngestionJob[] }>('/api/admin/ingestion-jobs'),
    getRevenue: () => request<{
      success: boolean;
      total_mrr: number;
      plan_breakdown: any[];
      recent_payments: any[];
    }>('/api/admin/revenue'),
    getSystem: () => request<{ success: boolean; system: SystemInfo }>('/api/admin/system'),
    getSystemHealth: () => request<any>('/api/admin/system'),
    clearCache: () => request('/api/admin/clear-cache', { method: 'POST' }),
    restartWorker: () => request('/api/admin/restart-worker', { method: 'POST' })
  }
};
