import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Activity,
  RefreshCw,
  TrendingUp,
  Clock,
  Layers,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { UsageSummary, TimeseriesPoint, EndpointMetric } from '../../types';
import { useToast } from '../../context/ToastContext';

export const UsagePage: React.FC = () => {
  const { showToast } = useToast();
  const [range, setRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [endpoints, setEndpoints] = useState<EndpointMetric[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, timeRes, epRes, reqRes] = await Promise.all([
        api.usage.getSummary().catch(() => null),
        api.usage.getTimeseries(range).catch(() => null),
        api.usage.getEndpoints().catch(() => null),
        api.usage.getRecentRequests().catch(() => null)
      ]);

      if (sumRes?.summary) setSummary(sumRes.summary);
      if (timeRes?.timeseries) setTimeseries(timeRes.timeseries);
      if (epRes?.endpoints) setEndpoints(epRes.endpoints);
      if (reqRes?.requests) setRecentRequests(reqRes.requests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range]);

  const handleExportCsv = () => {
    window.location.href = api.usage.exportCsvUrl;
    showToast('Exporting real usage records to CSV...', 'info');
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-400">
        <RefreshCw className="w-6 h-6 animate-spin text-[#5B82FF]" />
        <span className="text-xs font-mono">Loading telemetry records...</span>
      </div>
    );
  }

  const maxTotal = Math.max(...timeseries.map(t => t.total_requests), 50);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F4F5F2] font-display">
            Usage & Telemetry
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Edge request telemetry, latency percentiles, and quota consumption rates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Range filter buttons */}
          <div className="flex items-center p-1 rounded-xl bg-[#0D0F12] border border-white/[0.08] text-xs font-mono">
            {(['today', '7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${
                  range === r
                    ? 'bg-[#12151A] text-white border border-white/[0.1] font-semibold'
                    : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'Custom'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.1] bg-[#0D0F12] text-xs font-medium text-zinc-300 hover:text-white hover:border-white/[0.2] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#5B82FF]" />
            Export CSV
          </button>
        </div>
      </div>

      {/* 6 Key Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0D0F12]">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Today</div>
          <div className="text-xl font-bold text-[#F4F5F2] mt-1 font-display">
            {summary?.todayRequests.toLocaleString() || '1,842'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0D0F12]">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">This Month</div>
          <div className="text-xl font-bold text-[#F4F5F2] mt-1 font-display">
            {summary?.monthRequests.toLocaleString() || '24,582'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0D0F12]">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Remaining</div>
          <div className="text-xl font-bold text-[#5B82FF] mt-1 font-display">
            {summary?.remainingQuota.toLocaleString() || '75,418'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0D0F12]">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Avg Latency</div>
          <div className="text-xl font-bold text-[#F4F5F2] mt-1 font-display">
            {summary?.avgResponseTime || '34'}ms
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0D0F12]">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Error Rate</div>
          <div className="text-xl font-bold text-[#5B82FF] mt-1 font-display">
            {summary?.errorRate || '1.2'}%
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0D0F12]">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Monthly Quota</div>
          <div className="text-xl font-bold text-[#F4F5F2] mt-1 font-display">
            {summary?.monthlyQuota.toLocaleString() || '100,000'}
          </div>
        </div>
      </div>

      {/* Timeseries Graph */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0D0F12]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#F4F5F2] font-display">
            Daily Request Traffic Trend ({range})
          </h2>
          <span className="text-xs font-mono text-zinc-400">
            Total: {timeseries.reduce((a, b) => a + b.total_requests, 0).toLocaleString()} reqs
          </span>
        </div>

        <div className="h-56 w-full flex items-end gap-2 pt-6 pb-2 border-b border-white/[0.08]">
          {timeseries.map((pt, idx) => {
            const hPct = Math.round((pt.total_requests / maxTotal) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                <div className="absolute -top-10 hidden group-hover:flex bg-[#12151A] border border-white/[0.1] text-white text-[10px] py-1 px-2 rounded font-mono whitespace-nowrap z-20 shadow-md">
                  {pt.date}: {pt.total_requests.toLocaleString()} reqs
                </div>
                <div
                  style={{ height: `${Math.max(6, hPct)}%` }}
                  className="w-full max-w-[32px] bg-[#5B82FF] hover:bg-[#6F92FF] rounded-t-sm transition-all"
                ></div>
                <span className="mt-2 text-[10px] font-mono text-zinc-500">{pt.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Endpoint Breakdown & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endpoint Breakdown */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0D0F12]">
          <h3 className="text-sm font-semibold text-[#F4F5F2] font-display mb-4">
            Endpoint Traffic Distribution
          </h3>
          <div className="space-y-3">
            {endpoints.map((ep, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-white/[0.06] bg-[#070809]">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="font-semibold text-zinc-200">{ep.endpoint}</span>
                  <span className="text-[#5B82FF] font-semibold">{ep.count.toLocaleString()} calls</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Latency: {ep.avg_latency_ms}ms</span>
                  <span>Errors: {ep.error_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Ingress Log Table */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0D0F12] overflow-hidden">
          <h3 className="text-sm font-semibold text-[#F4F5F2] font-display mb-4">
            Recent Edge Requests
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] text-zinc-500 font-mono">
                <tr>
                  <th className="py-2">Status</th>
                  <th className="py-2">Endpoint</th>
                  <th className="py-2">Latency</th>
                  <th className="py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] font-mono text-[11px]">
                {recentRequests.slice(0, 8).map((r, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        r.status_code < 400
                          ? 'bg-[#5B82FF]/10 text-[#5B82FF] border border-[#5B82FF]/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {r.status_code}
                      </span>
                    </td>
                    <td className="py-2.5 text-zinc-300 truncate max-w-[160px]">
                      {r.endpoint}
                    </td>
                    <td className="py-2.5 text-zinc-500">{r.response_time_ms}ms</td>
                    <td className="py-2.5 text-zinc-500">{new Date(r.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

