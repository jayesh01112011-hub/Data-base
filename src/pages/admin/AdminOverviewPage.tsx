import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  CreditCard,
  Database,
  AlertTriangle,
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
      showToast('Failed to load admin metrics', 'error');
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
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
        <span className="text-xs font-mono">Loading platform operations metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              OPERATIONS CONSOLE
            </span>
            <span className="text-xs text-zinc-400 font-mono">DB: {metrics?.databaseEngine || 'node:sqlite'}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            System Operations Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time telemetry, user accounts, ingestion queues, and revenue statistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/ingestion')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-sm transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Trigger Ingestion
          </button>
          <button
            onClick={fetchMetrics}
            className="p-2 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 9 Key Admin Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Total Users</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {metrics?.totalUsers.toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Active Accounts: <span className="text-emerald-400 font-semibold">{metrics?.activeUsers}</span>
          </p>
        </div>

        {/* Revenue */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Platform Revenue</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            ₹{metrics?.revenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Active Subscriptions: <span className="text-white font-semibold">{metrics?.activeSubscriptions}</span>
          </p>
        </div>

        {/* Total API Requests */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Total Ingress Requests</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {metrics?.totalRequests.toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            API Error Rate: <span className="text-amber-400 font-semibold">{metrics?.apiErrorRate}%</span>
          </p>
        </div>

        {/* Datasets Count */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Published Datasets</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {metrics?.datasetsCount}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Normalized schema collections</p>
        </div>

        {/* Ingestion Pipeline Health */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Ingestion Status</span>
            <PlayCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white flex items-center gap-2">
            <span>Operational</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Failed jobs in 24h: <span className="text-emerald-400 font-semibold">{metrics?.failedIngestionJobs}</span>
          </p>
        </div>

        {/* System Uptime */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">System Health</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            99.99% SLA
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
          className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-zinc-700 cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Manage User Accounts</h3>
            <Users className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-xs text-zinc-400">Search developers, inspect API key allocations, and modify roles.</p>
        </div>

        <div
          onClick={() => navigate('/admin/datasets')}
          className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-zinc-700 cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Dataset Registry</h3>
            <Database className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-xs text-zinc-400">Create new dataset schemas, edit field definitions, and toggle access.</p>
        </div>

        <div
          onClick={() => navigate('/admin/ingestion')}
          className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-zinc-700 cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Ingestion Pipeline Monitor</h3>
            <PlayCircle className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-xs text-zinc-400">View stages: Source → Collect → Validate → Normalize → Store → Publish.</p>
        </div>
      </div>
    </div>
  );
};
