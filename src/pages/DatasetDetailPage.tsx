import React, { useState, useEffect } from 'react';
import {
  Database,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Code2,
  Table,
  CheckCircle2,
  Key,
  ExternalLink
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ApiConsole } from '../components/ApiConsole';
import { api } from '../services/apiClient';
import { Dataset } from '../types';

interface DatasetDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const DatasetDetailPage: React.FC<DatasetDetailPageProps> = ({ slug, navigate }) => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'samples' | 'console'>('overview');

  useEffect(() => {
    setLoading(true);
    api.datasets.getBySlug(slug)
      .then((res) => {
        if (res.dataset) setDataset(res.dataset);
      })
      .catch(() => setDataset(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070809] flex flex-col">
        <Navbar currentPath="/datasets" navigate={navigate} />
        <div className="flex-1 flex items-center justify-center text-zinc-500">
          <RefreshCw className="w-6 h-6 animate-spin text-[#5B82FF]" />
        </div>
        <Footer navigate={navigate} />
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="min-h-screen bg-[#070809] text-[#F4F5F2] flex flex-col">
        <Navbar currentPath="/datasets" navigate={navigate} />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-bold font-display">Repository Not Found</h2>
          <p className="mt-2 text-sm text-zinc-400">The requested repository slug does not exist.</p>
          <button
            onClick={() => navigate('/datasets')}
            className="mt-4 px-4 py-2 rounded-xl bg-[#5B82FF] text-white text-xs font-semibold"
          >
            Back to Repositories
          </button>
        </div>
        <Footer navigate={navigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070809] text-[#F4F5F2] flex flex-col transition-colors">
      <Navbar currentPath="/datasets" navigate={navigate} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Link */}
        <button
          onClick={() => navigate('/datasets')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white mb-6 transition-colors font-sans"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Repositories</span>
        </button>

        {/* Dataset Header Card */}
        <div className="p-6 md:p-8 rounded-2xl border border-white/[0.08] bg-[#0D0F12] mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400 border border-white/[0.08]">
                  {dataset.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#5B82FF] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5B82FF]"></span>
                  {dataset.status.toUpperCase()}
                </span>
                <span className="text-xs text-zinc-600">•</span>
                <span className="text-xs text-zinc-400 font-mono">Sync Cadence: {dataset.update_frequency}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F5F2] font-display">
                {dataset.name}
              </h1>

              <p className="text-sm text-zinc-400 leading-relaxed font-sans">
                {dataset.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-zinc-500" />
                  <span>{dataset.record_count.toLocaleString()} Records</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#5B82FF]" />
                  <span>{dataset.source_license}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-zinc-500" />
                  <span>{dataset.api_endpoint}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:w-48 shrink-0 font-sans">
              <button
                onClick={() => navigate('/dashboard/api-keys')}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#5B82FF] hover:bg-[#6F92FF] text-white shadow-sm transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                Generate API Key
              </button>
              <button
                onClick={() => setActiveTab('console')}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border border-white/[0.1] bg-[#12151A] text-zinc-200 hover:bg-white/[0.08] transition-colors"
              >
                <Terminal className="w-3.5 h-3.5 text-[#5B82FF]" />
                Test in Console
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] mb-8 font-sans">
          {[
            { id: 'overview', label: 'Provenance & Details', icon: ShieldCheck },
            { id: 'schema', label: 'Schema Fields', icon: Table },
            { id: 'samples', label: 'Sample Payload', icon: Code2 },
            { id: 'console', label: 'Live Console', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  active
                    ? 'border-[#5B82FF] text-[#5B82FF]'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0D0F12]">
                <h3 className="text-xs font-mono uppercase text-zinc-500 mb-1">Upstream Source</h3>
                <p className="text-sm font-semibold text-[#F4F5F2]">{dataset.source_name}</p>
                <p className="text-xs text-zinc-400 mt-2 font-sans">
                  Continuous multi-threaded ingestors with cryptographic checksum verification and deduplication.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0D0F12]">
                <h3 className="text-xs font-mono uppercase text-zinc-500 mb-1">Legal Licensing</h3>
                <p className="text-sm font-semibold text-[#F4F5F2]">{dataset.source_license}</p>
                <p className="text-xs text-zinc-400 mt-2 font-sans">
                  Approved for commercial exploitation, enterprise analytics, derivative models, and production systems.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0D0F12]">
                <h3 className="text-xs font-mono uppercase text-zinc-500 mb-1">Standardization</h3>
                <p className="text-sm font-semibold text-[#F4F5F2]">ISO 8601 / OCDS Compliant</p>
                <p className="text-xs text-zinc-400 mt-2 font-sans">
                  Dates, geographic coordinates, ISO currency conversions, and schemas normalized to strict specifications.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0D0F12]">
              <h3 className="text-sm font-bold text-[#F4F5F2] font-display mb-3">
                API Endpoint Specifications
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#070809] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-[#5B82FF]/20 text-[#5B82FF] text-[10px] font-bold">GET</span>
                    <span>{dataset.api_endpoint}</span>
                  </div>
                  <span className="text-zinc-500 text-[11px]">JSON / Query params</span>
                </div>
                <div className="p-3 rounded-xl bg-[#070809] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-[#5B82FF]/20 text-[#5B82FF] text-[10px] font-bold">GET</span>
                    <span>{dataset.api_endpoint}/:id</span>
                  </div>
                  <span className="text-zinc-500 text-[11px]">Primary Key lookup</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="rounded-2xl border border-white/[0.08] bg-[#0D0F12] overflow-hidden">
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F4F5F2] font-display">Normalized Field Definitions</h3>
              <span className="text-xs font-mono text-zinc-500">{dataset.schema_fields.length} Fields Defined</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070809] border-b border-white/[0.08] font-mono text-zinc-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Column / Field</th>
                    <th className="px-6 py-3 font-semibold">Data Type</th>
                    <th className="px-6 py-3 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {dataset.schema_fields.map((f, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-3.5 font-mono font-semibold text-[#5B82FF]">
                        {f.name}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-zinc-400">
                        <span className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[11px]">
                          {f.type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-zinc-300 font-sans">
                        {f.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'samples' && (
          <div className="rounded-2xl border border-white/[0.08] bg-[#0D0F12] overflow-hidden text-[#F4F5F2]">
            <div className="px-5 py-3 bg-[#070809] border-b border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Sample JSON Response Payload</span>
              <span className="text-[#5B82FF]">200 OK</span>
            </div>
            <pre className="p-6 font-mono text-xs overflow-x-auto leading-relaxed text-zinc-300 bg-[#070809]">
              {JSON.stringify(dataset.sample_records || [], null, 2)}
            </pre>
          </div>
        )}

        {activeTab === 'console' && (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[#F4F5F2] font-display">Interactive Gateway Console</h3>
              <p className="text-xs text-zinc-400 font-sans">
                Execute live HTTP queries against the backend repository engine.
              </p>
            </div>
            <ApiConsole initialEndpoint={dataset.api_endpoint} />
          </div>
        )}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
};

