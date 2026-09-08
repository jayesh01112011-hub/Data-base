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
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
        <Navbar currentPath="/datasets" navigate={navigate} />
        <div className="flex-1 flex items-center justify-center text-zinc-500">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
        <Footer navigate={navigate} />
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
        <Navbar currentPath="/datasets" navigate={navigate} />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-bold">Dataset Not Found</h2>
          <p className="mt-2 text-sm text-zinc-500">The requested dataset slug does not exist.</p>
          <button
            onClick={() => navigate('/datasets')}
            className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
          >
            Back to Catalog
          </button>
        </div>
        <Footer navigate={navigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Navbar currentPath="/datasets" navigate={navigate} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Link */}
        <button
          onClick={() => navigate('/datasets')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Datasets</span>
        </button>

        {/* Dataset Header Card */}
        <div className="p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {dataset.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {dataset.status.toUpperCase()}
                </span>
                <span className="text-xs text-zinc-500">•</span>
                <span className="text-xs text-zinc-500 font-mono">Updated {dataset.update_frequency}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
                {dataset.name}
              </h1>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {dataset.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-zinc-400" />
                  <span>{dataset.record_count.toLocaleString()} Records</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{dataset.source_license}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-zinc-400" />
                  <span>{dataset.api_endpoint}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:w-48 shrink-0">
              <button
                onClick={() => navigate('/dashboard/api-keys')}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                Use API Keys
              </button>
              <button
                onClick={() => setActiveTab('console')}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                Query in Console
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 mb-8">
          {[
            { id: 'overview', label: 'Provenance & Details', icon: ShieldCheck },
            { id: 'schema', label: 'Schema Fields', icon: Table },
            { id: 'samples', label: 'Sample Records', icon: Code2 },
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
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
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
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h3 className="text-xs font-mono uppercase text-zinc-400 mb-1">Upstream Source</h3>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{dataset.source_name}</p>
                <p className="text-xs text-zinc-500 mt-2">
                  Ingested via continuous REST and webhook ingestors with cryptographic checksum verification.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h3 className="text-xs font-mono uppercase text-zinc-400 mb-1">Legal Licensing</h3>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{dataset.source_license}</p>
                <p className="text-xs text-zinc-500 mt-2">
                  Permitted for commercial exploitation, analytics, derivative models, and downstream applications.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h3 className="text-xs font-mono uppercase text-zinc-400 mb-1">Normalization Standard</h3>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">ISO 8601 / OCDS Compliant</p>
                <p className="text-xs text-zinc-500 mt-2">
                  All dates, numeric values, and geographic identifiers follow standardized international formats.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                API Endpoint Specifications
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">GET</span>
                    <span>{dataset.api_endpoint}</span>
                  </div>
                  <span className="text-zinc-500 text-[11px]">JSON / Paginated</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">GET</span>
                    <span>{dataset.api_endpoint}/:id</span>
                  </div>
                  <span className="text-zinc-500 text-[11px]">Direct record lookup</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Normalized Field Definitions</h3>
              <span className="text-xs font-mono text-zinc-500">{dataset.schema_fields.length} Fields Defined</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 font-mono text-zinc-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Column / Field</th>
                    <th className="px-6 py-3 font-semibold">Data Type</th>
                    <th className="px-6 py-3 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {dataset.schema_fields.map((f, i) => (
                    <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-3.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {f.name}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-zinc-500">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px]">
                          {f.type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-zinc-600 dark:text-zinc-400">
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
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 overflow-hidden text-zinc-100">
            <div className="px-5 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Sample JSON Response Payload</span>
              <span className="text-emerald-400">200 OK</span>
            </div>
            <pre className="p-6 font-mono text-xs overflow-x-auto leading-relaxed text-zinc-300">
              {JSON.stringify(dataset.sample_records || [], null, 2)}
            </pre>
          </div>
        )}

        {activeTab === 'console' && (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Interactive Query Playground</h3>
              <p className="text-xs text-zinc-500">
                Execute live HTTP queries against the backend database using your active session.
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
