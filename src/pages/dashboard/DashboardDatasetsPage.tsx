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
        <h1 className="text-2xl font-bold tracking-tight text-[#F4F5F2] font-display">
          Connected Datasets
        </h1>
        <p className="text-xs text-zinc-400 mt-1 font-sans">
          Browse pipeline schemas, inspect schema topologies, and execute live queries against subscribed data feeds.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex items-center justify-center gap-2 text-zinc-400">
          <RefreshCw className="w-5 h-5 animate-spin text-[#5B82FF]" />
          <span className="text-xs font-mono">Loading data feeds...</span>
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
                    ? 'border-[#5B82FF] bg-[#5B82FF]/5 shadow-sm'
                    : 'border-white/[0.08] bg-[#0D0F12] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#12151A] text-zinc-400 border border-white/[0.05]">
                    {d.category}
                  </span>
                  <span className="text-[11px] font-mono text-[#5B82FF]">
                    {d.record_count.toLocaleString()} recs
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#F4F5F2] font-display">{d.name}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1 font-sans">{d.description}</p>
              </div>
            ))}
          </div>

          {/* Dataset Detail & Interactive Query */}
          <div className="lg:col-span-2 space-y-6">
            {selectedDataset && (
              <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0D0F12] space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[#F4F5F2] font-display">
                      {selectedDataset.name}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1 font-sans">{selectedDataset.description}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/datasets/${selectedDataset.slug}`)}
                    className="inline-flex items-center gap-1 text-xs text-[#5B82FF] font-medium hover:underline"
                  >
                    <span>Full Schema</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#070809] border border-white/[0.06] text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">SYNC FREQUENCY</span>
                    <span className="font-medium text-zinc-300">{selectedDataset.update_frequency}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">PROVENANCE LICENSE</span>
                    <span className="font-medium text-zinc-300 truncate block">{selectedDataset.source_license}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">API ENDPOINT</span>
                    <span className="font-medium text-[#5B82FF] truncate block">{selectedDataset.api_endpoint}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono mb-3">
                    Interactive Ingress Probe
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

