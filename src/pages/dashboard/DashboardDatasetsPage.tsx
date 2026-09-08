import React, { useState, useEffect } from 'react';
import { Database, Search, ArrowRight, RefreshCw, Terminal, ExternalLink } from 'lucide-react';
import { api } from '../../services/apiClient';
import { Dataset } from '../../types';
import { ApiConsole } from '../../components/ApiConsole';

interface DashboardDatasetsPageProps {
  navigate: (path: string) => void;
}

export const DashboardDatasetsPage: React.FC<DashboardDatasetsPageProps> = ({ navigate }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  useEffect(() => {
    api.datasets.list()
      .then(res => {
        if (res.datasets) {
          setDatasets(res.datasets);
          if (res.datasets.length > 0) setSelectedDataset(res.datasets[0]);
        }
      })
      .catch(() => setDatasets([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Connected Datasets
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Browse schema structures and test live queries against your subscribed data feeds.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex items-center justify-center gap-2 text-zinc-400">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
          <span className="text-xs">Loading datasets...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Datasets List */}
          <div className="space-y-3 lg:col-span-1">
            {datasets.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDataset(d)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedDataset?.id === d.id
                    ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {d.category}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-500">
                    {d.record_count.toLocaleString()} recs
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{d.name}</h3>
                <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{d.description}</p>
              </div>
            ))}
          </div>

          {/* Dataset Detail & Interactive Query */}
          <div className="lg:col-span-2 space-y-6">
            {selectedDataset && (
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                      {selectedDataset.name}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">{selectedDataset.description}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/datasets/${selectedDataset.slug}`)}
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    <span>Full Schema</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">SYNC FREQUENCY</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedDataset.update_frequency}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">PROVENANCE LICENSE</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">{selectedDataset.source_license}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">API ENDPOINT</span>
                    <span className="font-semibold text-emerald-500 truncate block">{selectedDataset.api_endpoint}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono mb-3">
                    Live Playground Query
                  </h3>
                  <ApiConsole initialEndpoint={selectedDataset.api_endpoint} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
