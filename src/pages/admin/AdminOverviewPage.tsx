import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  CreditCard,
  Database,
  Server,
  RefreshCw,
  PlayCircle,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { AdminMetrics } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AdminOverviewPageProps {
  navigate: (path: string) => void;
}

export const AdminOverviewPage: React.FC<AdminOverviewPageProps> = ({ navigate }) => {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getMetrics();
      if (res.metrics) setMetrics(res.metrics);
    } catch {
      showToast('Failed to load operations metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <RefreshCw className="w-6 h-6 animate-spin text-[#5B82FF]" />
        <span className="text-xs font-mono">Loading platform operations telemetry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#5B82FF]/15 text-[#5B82FF] border border-[#5B82FF]/30">
              OPERATIONS CONSOLE
            </span>
            <span className="text-xs text-zinc-500 font-mono">ENGINE: {metrics?.databaseEngine || 'node:sqlite'}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F4F5F2] font-display">
            System Operations Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Real-time developer telemetry, pipeline ingestion states, and capacity utilization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/ingestion')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#5B82FF] hover:bg-[#6F92FF] text-white shadow-sm transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Trigger Ingestion
          </button>
          <button
            onClick={fetchMetrics}
            className="p-2 rounded-lg border border-white/[0.1] bg-[#0D0F12] text-zinc-300 hover:bg-white/[0.05] transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6 Key Admin Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Developer Accounts</span>
            <Users className="w-4 h-4 text-[#5B82FF]" />
          </div>
          <div className="text-3xl font-bold text-[#F4F5F2] font-display">
            {metrics?.totalUsers.toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            Active Accounts: <span className="text-[#5B82FF] font-semibold">{metrics?.activeUsers}</span>
          </p>
        </div>

        {/* Revenue */}
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Platform Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#5B82FF]" />
          </div>
          <div className="text-3xl font-bold text-[#F4F5F2] font-display">
            ₹{metrics?.revenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            Active Subscriptions: <span className="text-white font-semibold">{metrics?.activeSubscriptions}</span>
          </p>
        </div>

        {/* Total API Requests */}
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Edge Ingress Requests</span>
            <Activity className="w-4 h-4 text-[#5B82FF]" />
          </div>
          <div className="text-3xl font-bold text-[#F4F5F2] font-display">
            {metrics?.totalRequests.toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            Error Rate: <span className="text-zinc-300 font-semibold">{metrics?.apiErrorRate}%</span>
          </p>
        </div>

        {/* Datasets Count */}
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Published Pipelines</span>
            <Database className="w-4 h-4 text-[#5B82FF]" />
          </div>
          <div className="text-3xl font-bold text-[#F4F5F2] font-display">
            {metrics?.datasetsCount}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-sans">Normalized schema collections</p>
        </div>

        {/* Ingestion Pipeline Health */}
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Ingestion Status</span>
            <PlayCircle className="w-4 h-4 text-[#5B82FF]" />
          </div>
          <div className="text-3xl font-bold text-[#F4F5F2] font-display flex items-center gap-2">
            <span>Operational</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            Failed jobs in 24h: <span className="text-[#5B82FF] font-semibold">{metrics?.failedIngestionJobs}</span>
          </p>
        </div>

        {/* System Uptime */}
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Infrastructure SLA</span>
            <Server className="w-4 h-4 text-[#5B82FF]" />
          </div>
          <div className="text-3xl font-bold text-[#5B82FF] font-display flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5B82FF] animate-pulse"></span>
            99.99%
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            Process Uptime: {Math.floor((metrics?.uptimeSeconds || 0) / 60)}m {(metrics?.uptimeSeconds || 0) % 60}s
          </p>
        </div>
      </div>

      {/* Quick Nav Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/admin/users')}
          className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12] hover:border-white/[0.18] cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F4F5F2] font-display group-hover:text-[#5B82FF] transition-colors">Developer Directory</h3>
            <Users className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-xs text-zinc-400 font-sans">Search developer profiles, manage authorization tiers, and audit API keys.</p>
        </div>

        <div
          onClick={() => navigate('/admin/datasets')}
          className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12] hover:border-white/[0.18] cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F4F5F2] font-display group-hover:text-[#5B82FF] transition-colors">Dataset Schema Registry</h3>
            <Database className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-xs text-zinc-400 font-sans">Register new datasets, edit data topology fields, and modify access rules.</p>
        </div>

        <div
          onClick={() => navigate('/admin/ingestion')}
          className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12] hover:border-white/[0.18] cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F4F5F2] font-display group-hover:text-[#5B82FF] transition-colors">Ingestion Pipeline Monitor</h3>
            <PlayCircle className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-xs text-zinc-400 font-sans">Monitor pipeline stages: Source → Collect → Validate → Normalize → Store → Publish.</p>
        </div>
      </div>
    </div>
  );
};

