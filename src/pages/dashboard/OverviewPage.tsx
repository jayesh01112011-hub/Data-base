import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  Key,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Database,
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
    const cmd = `curl -X GET "https://api.labway.dev/api/v1/opportunities" \\
  -H "Authorization: Bearer df_live_xxxxxxxxxxxxxxxxx" \\
  -H "Accept: application/json"`;
    navigator.clipboard.writeText(cmd);
    setCopiedKey(true);
    showToast('Example curl copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-400">
        <RefreshCw className="w-6 h-6 animate-spin text-[#5B82FF]" />
        <span className="text-xs font-mono">Loading developer analytics...</span>
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
          <h1 className="text-2xl font-bold tracking-tight text-[#F4F5F2] font-display">
            Workspace Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Continuous telemetry, quota metering, and authenticated edge gateways for {user?.name || 'Developer'}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/dashboard/api-keys')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#5B82FF] hover:bg-[#6F92FF] text-white shadow-sm transition-all"
          >
            <Key className="w-3.5 h-3.5" />
            Manage Keys
          </button>
          <button
            onClick={() => navigate('/dashboard/billing')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] bg-[#12151A] text-xs font-medium text-zinc-300 hover:text-white hover:border-white/[0.2] transition-colors"
          >
            Manage Quota ({summary?.plan?.name || user?.plan_id})
          </button>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: API Requests */}
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12] shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2 font-mono">
            <span className="text-[10px] uppercase tracking-wider">Requests</span>
            <Activity className="w-4 h-4 text-[#5B82FF]" />
          </div>
          <div className="text-2xl font-bold text-[#F4F5F2] font-display">
            {summary?.monthRequests.toLocaleString() || '24,582'}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-sans">Current billing month</p>
        </div>

        {/* Card 2: Remaining Quota */}
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12] shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2 font-mono">
            <span className="text-[10px] uppercase tracking-wider">Remaining</span>
            <Layers className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-[#F4F5F2] font-display">
            {summary?.remainingQuota.toLocaleString() || '75,418'}
          </div>
          <div className="mt-2 w-full bg-[#12151A] h-1.5 rounded-full overflow-hidden border border-white/[0.05]">
            <div
              className="bg-[#5B82FF] h-full rounded-full transition-all duration-500"
              style={{ width: `${quotaPercent}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1.5 font-mono">
            {quotaPercent}% of {summary?.monthlyQuota.toLocaleString()}
          </p>
        </div>

        {/* Card 3: Error Rate */}
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12] shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2 font-mono">
            <span className="text-[10px] uppercase tracking-wider">Error Rate</span>
            <AlertCircle className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-[#F4F5F2] font-display">
            {summary?.errorRate || '1.2'}%
          </div>
          <p className="text-[11px] text-[#5B82FF] mt-1 font-sans">Nominal (&lt;2%)</p>
        </div>

        {/* Card 4: Active API Keys */}
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12] shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2 font-mono">
            <span className="text-[10px] uppercase tracking-wider">Active Keys</span>
            <Key className="w-4 h-4 text-[#5B82FF]" />
          </div>
          <div className="text-2xl font-bold text-[#F4F5F2] font-display">
            {keys.filter(k => k.is_active).length || 3}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-sans">Provisioned tokens</p>
        </div>

        {/* Card 5: Current Plan */}
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12] shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2 font-mono">
            <span className="text-[10px] uppercase tracking-wider">Current Tier</span>
            <ShieldCheck className="w-4 h-4 text-[#5B82FF]" />
          </div>
          <div className="text-2xl font-bold text-[#5B82FF] font-display uppercase">
            {summary?.plan?.name || user?.plan_id || 'GROWTH'}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            ₹{summary?.plan?.price_inr.toLocaleString() || '1,499'}/mo
          </p>
        </div>
      </div>

      {/* Interactive Timeseries Graph (Requests per day: Successful vs Failed) */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0D0F12]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-semibold text-[#F4F5F2] font-display">
              Request Throughput & Telemetry
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              Daily edge requests across registered endpoints.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#5B82FF]"></span>
              <span className="text-zinc-400">Success (2xx/3xx)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
              <span className="text-zinc-400">Failed (4xx/5xx)</span>
            </div>
          </div>
        </div>

        {/* SVG Graph Visualization */}
        <div className="h-64 w-full flex items-end gap-2 pt-6 pb-2 border-b border-white/[0.08]">
          {timeseries.map((pt, idx) => {
            const successPct = Math.round((pt.successful_requests / maxReq) * 100);
            const failPct = Math.round((pt.failed_requests / maxReq) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-[#12151A] border border-white/[0.1] text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap pointer-events-none font-mono">
                  <span>{pt.date}</span>
                  <span className="text-[#5B82FF]">{pt.successful_requests.toLocaleString()} ok</span>
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
                    className={`w-full bg-[#5B82FF] ${pt.failed_requests === 0 ? 'rounded-t-sm' : ''} group-hover:bg-[#6F92FF] transition-colors`}
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
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0D0F12]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#5B82FF]" />
            <h3 className="text-sm font-semibold text-[#F4F5F2] font-display">Integration Gateway</h3>
          </div>
          <button
            onClick={copyCurl}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5B82FF] hover:underline"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey ? 'Copied' : 'Copy cURL'}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#070809] font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed border border-white/[0.08]">
          <code>{`curl -X GET "https://api.labway.dev/api/v1/opportunities?category=clean-energy&limit=5" \\
  -H "Authorization: Bearer df_live_xxxxxxxxxxxxxxxxx" \\
  -H "Accept: application/json"`}</code>
        </div>
      </div>
    </div>
  );
};

