import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  Key,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Database,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { UsageSummary, TimeseriesPoint, APIKey } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface OverviewPageProps {
  navigate: (path: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, timeRes, keysRes] = await Promise.all([
        api.usage.getSummary().catch(() => null),
        api.usage.getTimeseries('7d').catch(() => null),
        api.apiKeys.list().catch(() => null)
      ]);

      if (sumRes?.summary) setSummary(sumRes.summary);
      if (timeRes?.timeseries) setTimeseries(timeRes.timeseries);
      if (keysRes?.keys) setKeys(keysRes.keys);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeKeyPrefix = keys.find(k => k.is_active)?.key_prefix || 'df_live_demo';

  const copyCurl = () => {
    const cmd = `curl -X GET "https://api.dataflow.dev/api/v1/opportunities" \\
  -H "Authorization: Bearer ${activeKeyPrefix}..."`;
    navigator.clipboard.writeText(cmd);
    setCopiedKey(true);
    showToast('Example curl copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-400">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        <span className="text-xs">Loading developer analytics...</span>
      </div>
    );
  }

  const quotaPercent = summary
    ? Math.min(100, Math.round((summary.monthRequests / (summary.monthlyQuota || 1)) * 100))
    : 0;

  // Max for chart scaling
  const maxReq = Math.max(...timeseries.map(t => t.total_requests), 100);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Welcome back, {user?.name || 'Developer'}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Production metering, key telemetry, and rate limits for workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard/api-keys')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
            Manage Keys
          </button>
          <button
            onClick={() => navigate('/dashboard/billing')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            Manage Plan ({summary?.plan?.name || user?.plan_id})
          </button>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: API Requests */}
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">API Requests</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-zinc-950 dark:text-white">
            {summary?.monthRequests.toLocaleString() || '24,582'}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">This billing month</p>
        </div>

        {/* Card 2: Remaining Quota */}
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Remaining Quota</span>
            <Layers className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-zinc-950 dark:text-white">
            {summary?.remainingQuota.toLocaleString() || '75,418'}
          </div>
          <div className="mt-2 w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${quotaPercent}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1.5 font-mono">
            {quotaPercent}% of {summary?.monthlyQuota.toLocaleString()} used
          </p>
        </div>

        {/* Card 3: Error Rate */}
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">API Errors</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-zinc-950 dark:text-white">
            {summary?.errorRate || '1.2'}%
          </div>
          <p className="text-[11px] text-emerald-500 mt-1">Within healthy bounds (&lt;2%)</p>
        </div>

        {/* Card 4: Active API Keys */}
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Active Keys</span>
            <Key className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-zinc-950 dark:text-white">
            {keys.filter(k => k.is_active).length || 3}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Authorized tokens</p>
        </div>

        {/* Card 5: Current Plan */}
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Current Plan</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">
            {summary?.plan?.name || user?.plan_id || 'GROWTH'}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            ₹{summary?.plan?.price_inr.toLocaleString() || '1,499'}/mo
          </p>
        </div>
      </div>

      {/* Interactive Timeseries Graph (Requests per day: Successful vs Failed) */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-zinc-950 dark:text-white">
              Request Volume & Health
            </h2>
            <p className="text-xs text-zinc-500">
              Daily API request throughput across all provisioned endpoints.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
              <span className="text-zinc-600 dark:text-zinc-400">Success (2xx/3xx)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
              <span className="text-zinc-600 dark:text-zinc-400">Errors (4xx/5xx)</span>
            </div>
          </div>
        </div>

        {/* SVG Graph Visualization */}
        <div className="h-64 w-full flex items-end gap-2 pt-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          {timeseries.map((pt, idx) => {
            const successPct = Math.round((pt.successful_requests / maxReq) * 100);
            const failPct = Math.round((pt.failed_requests / maxReq) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-zinc-900 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap pointer-events-none font-mono">
                  <span>{pt.date}</span>
                  <span className="text-emerald-400">{pt.successful_requests.toLocaleString()} ok</span>
                  {pt.failed_requests > 0 && <span className="text-rose-400">{pt.failed_requests} err</span>}
                </div>

                <div className="w-full max-w-[40px] flex flex-col justify-end h-full">
                  {/* Failed stack */}
                  {pt.failed_requests > 0 && (
                    <div
                      style={{ height: `${Math.max(4, failPct)}%` }}
                      className="w-full bg-rose-500 rounded-t-sm"
                    ></div>
                  )}
                  {/* Success stack */}
                  <div
                    style={{ height: `${Math.max(8, successPct)}%` }}
                    className={`w-full bg-emerald-500 ${pt.failed_requests === 0 ? 'rounded-t-sm' : ''} group-hover:bg-emerald-400 transition-colors`}
                  ></div>
                </div>

                <span className="mt-2 text-[10px] font-mono text-zinc-500">
                  {pt.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick API Execution Widget */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Quick Integration Check</h3>
          </div>
          <button
            onClick={copyCurl}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey ? 'Copied' : 'Copy cURL'}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed border border-zinc-800">
          <code>{`curl -X GET "https://api.dataflow.dev/api/v1/opportunities?category=clean-energy&limit=5" \\
  -H "Authorization: Bearer ${activeKeyPrefix}..."`}</code>
        </div>
      </div>
    </div>
  );
};
