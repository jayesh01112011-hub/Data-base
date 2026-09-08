import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  PlayCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

export const AdminDatasetsPage: React.FC = () => {
  const { showToast } = useToast();
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingestingId, setIngestingId] = useState<string | null>(null);

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('procurement');
  const [sourceName, setSourceName] = useState('');
  const [sourceLicense, setSourceLicense] = useState('Open Government License (OGDL) v2.0');
  const [updateFrequency, setUpdateFrequency] = useState('Hourly');

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getDatasets();
      if (res.datasets) setDatasets(res.datasets);
    } catch {
      showToast('Failed to load datasets registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleTriggerIngestion = async (id: string, name: string) => {
    setIngestingId(id);
    showToast(`Triggering ingestion pipeline for "${name}"...`, 'info');
    try {
      const res = await api.admin.triggerIngestion(id);
      showToast(`Ingestion complete: Processed ${res.job.records_processed} records.`, 'success');
      fetchDatasets();
    } catch (err: any) {
      showToast(err.message || 'Ingestion job failed', 'error');
    } finally {
      setIngestingId(null);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.admin.toggleDataset(id);
      showToast('Dataset status updated', 'success');
      fetchDatasets();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle dataset', 'error');
    }
  };

  const handleCreateDataset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createDataset({
        name,
        slug,
        description,
        category,
        source_name: sourceName,
        source_license: sourceLicense,
        update_frequency: updateFrequency,
        schema_fields: [
          { name: 'id', type: 'string', description: 'Unique identifier' },
          { name: 'title', type: 'string', description: 'Name of the entity or entry' },
          { name: 'category', type: 'string', description: 'Normalized categorization taxonomy' },
          { name: 'created_at', type: 'iso8601', description: 'Record ingestion timestamp' }
        ]
      });
      showToast('New dataset catalog item created', 'success');
      setCreateOpen(false);
      setName('');
      setSlug('');
      setDescription('');
      fetchDatasets();
    } catch (err: any) {
      showToast(err.message || 'Failed to create dataset', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F4F5F2] font-display">
            Dataset Schema Registry
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Provision structured catalogs, trigger upstream ingestion jobs, and manage edge availability.
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5B82FF] hover:bg-[#6F92FF] text-white shadow-sm transition-colors self-start"
        >
          <Plus className="w-4 h-4" />
          Register New Dataset
        </button>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#0D0F12] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F4F5F2] font-display">Managed Data Pipelines</h3>
          <span className="text-xs font-mono text-zinc-500">{datasets.length} Active Feeds</span>
        </div>

        {loading ? (
          <div className="py-20 flex items-center justify-center gap-2 text-zinc-500">
            <RefreshCw className="w-5 h-5 animate-spin text-[#5B82FF]" />
            <span className="text-xs font-mono">Loading dataset records...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#070809] border-b border-white/[0.08] font-mono text-zinc-500">
                <tr>
                  <th className="px-6 py-3">Dataset Name & Endpoint</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Ingested Records</th>
                  <th className="px-6 py-3">Sync Cadence</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                {datasets.map((d) => (
                  <tr key={d.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-[#F4F5F2]">{d.name}</div>
                      <div className="text-[11px] font-mono text-[#5B82FF]">{d.api_endpoint}</div>
                    </td>
                    <td className="px-6 py-3.5 font-mono uppercase text-zinc-400">
                      {d.category}
                    </td>
                    <td className="px-6 py-3.5 font-mono font-bold text-[#F4F5F2]">
                      {(d.actual_records_count || d.record_count).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-zinc-400">
                      {d.update_frequency}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        d.status === 'active' ? 'bg-[#5B82FF]/10 text-[#5B82FF] border border-[#5B82FF]/20' : 'bg-[#12151A] text-zinc-500 border border-white/[0.05]'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2 font-mono">
                      <button
                        onClick={() => handleTriggerIngestion(d.id, d.name)}
                        disabled={ingestingId === d.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-[#5B82FF]/10 hover:bg-[#5B82FF]/20 text-[#5B82FF] border border-[#5B82FF]/30 transition-colors disabled:opacity-50"
                      >
                        {ingestingId === d.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
                        <span>Run Ingestion</span>
                      </button>
                      <button
                        onClick={() => handleToggle(d.id)}
                        className="p-1 text-zinc-400 hover:text-white transition-colors"
                        title={d.status === 'disabled' ? 'Enable' : 'Disable'}
                      >
                        {d.status === 'disabled' ? <ToggleLeft className="w-5 h-5 text-zinc-600" /> : <ToggleRight className="w-5 h-5 text-[#5B82FF]" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Dataset */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070809]/80 backdrop-blur-xs">
          <div className="bg-[#0D0F12] border border-white/[0.1] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-zinc-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#F4F5F2] font-display">Register New Public Dataset</h3>
              <button onClick={() => setCreateOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateDataset} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-medium mb-1 text-zinc-300">Dataset Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  placeholder="e.g. Global Renewable Energy Stations"
                  className="w-full px-3 py-2 rounded-lg border border-white/[0.1] bg-[#12151A] text-white focus:outline-none focus:border-[#5B82FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-zinc-300">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="renewable-energy"
                    className="w-full px-3 py-2 rounded-lg border border-white/[0.1] bg-[#12151A] text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-zinc-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/[0.1] bg-[#12151A] text-white"
                  >
                    <option value="procurement">procurement</option>
                    <option value="corporate">corporate</option>
                    <option value="environment">environment</option>
                    <option value="intellectual-property">intellectual-property</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1 text-zinc-300">Description</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of data provenance, collection methodology, and schema..."
                  className="w-full px-3 py-2 rounded-lg border border-white/[0.1] bg-[#12151A] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-zinc-300">Upstream Source Name</label>
                  <input
                    type="text"
                    required
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="e.g. International Energy Agency"
                    className="w-full px-3 py-2 rounded-lg border border-white/[0.1] bg-[#12151A] text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-zinc-300">Sync Cadence</label>
                  <select
                    value={updateFrequency}
                    onChange={(e) => setUpdateFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/[0.1] bg-[#12151A] text-white"
                  >
                    <option value="Every 5 minutes">Every 5 minutes</option>
                    <option value="Hourly">Hourly</option>
                    <option value="Daily">Daily</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-semibold bg-[#5B82FF] hover:bg-[#6F92FF] text-white transition-colors"
                >
                  Register Dataset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

