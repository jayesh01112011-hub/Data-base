import React, { useState, useEffect } from 'react';
import {
  PlayCircle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  Server,
  FileCode2,
  Database,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { IngestionJob, Dataset } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminIngestionPage: React.FC = () => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<IngestionJob[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Active Running Pipeline State
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [lastCompletedJob, setLastCompletedJob] = useState<IngestionJob | null>(null);

  const pipelineStages = [
    { name: '1. SOURCE', label: 'Upstream Legal Source', icon: Server, desc: 'Fetch feed' },
    { name: '2. COLLECT', label: 'Raw Extraction', icon: Layers, desc: 'Parse XML/JSON' },
    { name: '3. VALIDATE', label: 'Schema Validator', icon: ShieldCheck, desc: 'Enforce types' },
    { name: '4. NORMALIZE', label: 'Data Cleaning', icon: Zap, desc: 'Currencies & ISO dates' },
    { name: '5. DEDUP', label: 'Hash Deduplication', icon: FileCode2, desc: 'Fingerprint check' },
    { name: '6. STORE', label: 'Database Storage', icon: Database, desc: 'SQLite atomic insert' },
    { name: '7. PUBLISH', label: 'Publish Metadata', icon: CheckCircle2, desc: 'Update public counters' }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, dsRes] = await Promise.all([
        api.admin.getIngestionJobs(),
        api.datasets.list()
      ]);
      if (jobsRes.jobs) setJobs(jobsRes.jobs);
      if (dsRes.datasets) {
        setDatasets(dsRes.datasets);
        if (dsRes.datasets.length > 0 && !selectedDatasetId) {
          setSelectedDatasetId(dsRes.datasets[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunPipeline = async () => {
    if (!selectedDatasetId) return;

    setRunning(true);
    setActiveStep(0);
    showToast('Starting automated ingestion pipeline...', 'info');

    // Simulate stepping through visual stages
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < 6) return prev + 1;
        return prev;
      });
    }, 450);

    try {
      const res = await api.admin.triggerIngestion(selectedDatasetId);
      clearInterval(stepInterval);
      setActiveStep(6);
      setLastCompletedJob(res.job);
      showToast(`Ingestion completed: ${res.job.records_processed} records verified and published.`, 'success');
      fetchData();
    } catch (err: any) {
      clearInterval(stepInterval);
      showToast(err.message || 'Ingestion execution failed', 'error');
    } finally {
      setTimeout(() => {
        setRunning(false);
      }, 1000);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F4F5F2] font-display">
            Automated Ingestion Pipeline Engine
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Multi-stage extraction, validation, cleaning, deduplication, and atomic persistence.
          </p>
        </div>

        {/* Trigger Controls */}
        <div className="flex items-center gap-3 font-sans">
          <select
            value={selectedDatasetId}
            onChange={(e) => setSelectedDatasetId(e.target.value)}
            disabled={running}
            className="px-3 py-2 rounded-xl text-xs bg-[#0D0F12] border border-white/[0.1] text-zinc-200 focus:outline-none focus:border-[#5B82FF]"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <button
            onClick={handleRunPipeline}
            disabled={running || !selectedDatasetId}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5B82FF] hover:bg-[#6F92FF] text-white shadow-sm transition-all disabled:opacity-50"
          >
            {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            <span>{running ? 'Ingesting Stages...' : 'Run Ingestion Job'}</span>
          </button>
        </div>
      </div>

      {/* Visual Pipeline Stage Diagram */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0D0F12] shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#F4F5F2] uppercase tracking-wider font-mono">
            Pipeline Topology (7 Ingestion Stages)
          </h2>
          <span className="text-xs font-mono text-zinc-500">
            {running ? 'Execution in progress' : 'Engine Idle / Waiting'}
          </span>
        </div>

        {/* Pipeline Stage Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCurrent = running && activeStep === idx;
            const isCompleted = activeStep > idx || (!running && lastCompletedJob);

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-[#5B82FF] bg-[#5B82FF]/10 ring-1 ring-[#5B82FF]/50'
                    : isCompleted
                    ? 'border-[#5B82FF]/40 bg-[#5B82FF]/5'
                    : 'border-white/[0.06] bg-[#070809]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-[10px] font-mono font-bold text-zinc-400">{stage.name}</span>
                    <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#5B82FF] animate-bounce' : isCompleted ? 'text-[#5B82FF]' : 'text-zinc-600'}`} />
                  </div>
                  <h4 className="text-xs font-semibold text-white truncate">{stage.label}</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{stage.desc}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/[0.06] text-[10px] font-mono">
                  {isCurrent ? (
                    <span className="text-[#5B82FF] flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Running
                    </span>
                  ) : isCompleted ? (
                    <span className="text-[#5B82FF] flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> OK
                    </span>
                  ) : (
                    <span className="text-zinc-600">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Real-time Stage Breakdown Metrics for last completed job */}
        {lastCompletedJob && (
          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#070809] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">JOB EXECUTION TELEMETRY:</span>
              <span className="text-[#5B82FF] font-bold">Total Duration: {lastCompletedJob.duration_ms}ms</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#0D0F12] border border-white/[0.08]">
                <span className="text-[10px] text-zinc-500 uppercase block">Records Ingested</span>
                <span className="text-sm font-bold text-white">{(lastCompletedJob.stage_metrics?.ingested || lastCompletedJob.records_processed).toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0D0F12] border border-white/[0.08]">
                <span className="text-[10px] text-zinc-500 uppercase block">Schema Validated</span>
                <span className="text-sm font-bold text-[#5B82FF]">{(lastCompletedJob.stage_metrics?.validated || lastCompletedJob.records_processed).toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0D0F12] border border-white/[0.08]">
                <span className="text-[10px] text-zinc-500 uppercase block">Duplicates Dropped</span>
                <span className="text-sm font-bold text-zinc-300">{lastCompletedJob.stage_metrics?.deduplicated || 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0D0F12] border border-white/[0.08]">
                <span className="text-[10px] text-zinc-500 uppercase block">Database Stored</span>
                <span className="text-sm font-bold text-[#5B82FF]">{(lastCompletedJob.stage_metrics?.stored || lastCompletedJob.records_processed).toLocaleString()}</span>
              </div>
            </div>

            {lastCompletedJob.logs && (
              <div className="p-3 rounded-lg bg-[#0D0F12] border border-white/[0.08] text-[11px] font-mono text-zinc-300 overflow-x-auto space-y-1 max-h-32">
                <div className="text-zinc-500 text-[10px]">PIPELINE AUDIT LOG:</div>
                {lastCompletedJob.logs.map((lg, i) => (
                  <div key={i} className="text-[#5B82FF]/90">{lg}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Historical Ingestion Jobs Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0D0F12] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F4F5F2] font-display">Ingestion Job Audit History</h3>
          <span className="text-xs font-mono text-zinc-500">{jobs.length} Completed Runs</span>
        </div>

        {jobs.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs font-mono">
            No pipeline jobs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070809] border-b border-white/[0.08] font-mono text-zinc-500">
                <tr>
                  <th className="px-6 py-3">Job ID</th>
                  <th className="px-6 py-3">Dataset Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Records</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3 text-right">Started At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300 font-mono text-[11px]">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-3 font-semibold text-white">
                      {j.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-3 text-zinc-200">
                      {j.dataset_name || j.dataset_id}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        j.status === 'completed'
                          ? 'bg-[#5B82FF]/10 text-[#5B82FF] border border-[#5B82FF]/20'
                          : j.status === 'failed'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-white/[0.05] text-zinc-400'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-semibold text-[#F4F5F2]">
                      {j.records_processed.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-zinc-400">
                      {j.duration_ms}ms
                    </td>
                    <td className="px-6 py-3 text-right text-zinc-500">
                      {new Date(j.created_at).toLocaleString()}
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

