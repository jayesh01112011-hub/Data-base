import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  Database,
  Cpu,
  RefreshCw,
  Trash2,
  PlayCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

export const AdminSystemPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clearingCache, setClearingCache] = useState(false);
  const [restartingWorker, setRestartingWorker] = useState(false);

  const fetchSystem = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getSystemHealth();
      setData(res);
    } catch {
      showToast('Failed to load system metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystem();
  }, []);

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await api.admin.clearCache();
      showToast('Rate limiter in-memory burst cache cleared successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to clear cache', 'error');
    } finally {
      setClearingCache(false);
    }
  };

  const handleRestartWorker = async () => {
    setRestartingWorker(true);
    try {
      await api.admin.restartWorker();
      showToast('Ingestion background cron scheduler re-initialized', 'success');
      fetchSystem();
    } catch (err: any) {
      showToast(err.message || 'Failed to restart worker', 'error');
    } finally {
      setRestartingWorker(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
        <span className="text-xs font-mono">Loading system diagnostic telemetry...</span>
      </div>
    );
  }

  const memory = data?.memory || {};
  const tables = data?.tables || [];
  const errors = data?.recentErrors || [];

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            System Diagnostics & Node Telemetry
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Server memory, persistent SQLite partition record counts, and background worker queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearCache}
            disabled={clearingCache}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>{clearingCache ? 'Flushing...' : 'Flush Memory Cache'}</span>
          </button>

          <button
            onClick={handleRestartWorker}
            disabled={restartingWorker}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${restartingWorker ? 'animate-spin' : ''}`} />
            <span>{restartingWorker ? 'Restarting...' : 'Restart Ingestion Daemon'}</span>
          </button>
        </div>
      </div>

      {/* 4 Core Health Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Daemon Uptime</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {Math.floor((data?.uptime || 0) / 60)}m {(data?.uptime || 0) % 60}s
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-mono">Node.js {data?.nodeVersion}</p>
        </div>

        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Process Memory (RSS)</span>
            <Cpu className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {memory.rssMb || 0} MB
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">Heap Used: {memory.heapUsedMb || 0} MB</p>
        </div>

        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Active Workers</span>
            <Server className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {data?.activeWorkers || 1} Operational
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-mono">Cron Ingestion: OK</p>
        </div>

        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Storage Engine</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            SQLite (WAL)
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">Synchronous: Normal</p>
        </div>
      </div>

      {/* Database Tables and Record Counts */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4">
          Persistent Storage Tables & Partition Record Counts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          {tables.map((tbl: any, idx: number) => (
            <div key={idx} className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
              <span className="text-[10px] text-zinc-500 uppercase block truncate">{tbl.table}</span>
              <span className="text-base font-bold text-white mt-1 block">
                {Number(tbl.count).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Logs */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Ingress Error Audit Log (Recent Events)</h3>
          <span className="text-xs font-mono text-zinc-500">{errors.length} Recorded Anomalies</span>
        </div>

        {errors.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-emerald-400">
            No errors detected in the current audit window. API is operating cleanly.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-[11px]">
                <tr>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Endpoint</th>
                  <th className="px-6 py-3">Error Reason / Log</th>
                  <th className="px-6 py-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300 text-[11px]">
                {errors.map((err: any, idx: number) => (
                  <tr key={idx} className="hover:bg-zinc-800/40">
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {err.status_code}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-zinc-300">
                      {err.endpoint}
                    </td>
                    <td className="px-6 py-3 text-rose-400/90 truncate max-w-md">
                      {err.error_message || 'HTTP error occurred'}
                    </td>
                    <td className="px-6 py-3 text-right text-zinc-500">
                      {new Date(err.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
