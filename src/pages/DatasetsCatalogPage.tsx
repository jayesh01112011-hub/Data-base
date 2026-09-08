import React, { useState, useEffect } from 'react';
import { Search, Database, ArrowRight, RefreshCw, Filter, ShieldCheck } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { api } from '../services/apiClient';
import { Dataset } from '../types';

interface DatasetsCatalogPageProps {
  navigate: (path: string) => void;
}

export const DatasetsCatalogPage: React.FC<DatasetsCatalogPageProps> = ({ navigate }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const res = await api.datasets.list(category, search);
      if (res.datasets) setDatasets(res.datasets);
    } catch {
      setDatasets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, [category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDatasets();
  };

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'procurement', label: 'Procurement & RFPs' },
    { id: 'corporate', label: 'Corporate & Legal' },
    { id: 'environment', label: 'Environmental' },
    { id: 'intellectual-property', label: 'Intellectual Property' }
  ];

  return (
    <div className="min-h-screen bg-[#070809] text-[#F4F5F2] flex flex-col transition-colors">
      <Navbar currentPath="/datasets" navigate={navigate} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono text-[#5B82FF]">
            <Database className="w-4 h-4" />
            <span>CERTIFIED REPOSITORIES</span>
          </div>
          <h1 className="text-3xl font-bold text-[#F4F5F2] font-display tracking-tight">
            Data Infrastructure Repositories
          </h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl font-sans">
            Normalized, schema-validated public and enterprise feeds, ingested continuously and queryable via high-performance REST endpoints.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search repositories by schema, title, or parameters..."
              className="w-full pl-9 pr-24 py-2.5 rounded-xl border border-white/[0.08] bg-[#0D0F12] text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-[#5B82FF]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-[#5B82FF] hover:bg-[#6F92FF] text-white text-xs font-medium transition-colors"
            >
              Search
            </button>
          </form>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  category === cat.id
                    ? 'bg-white/[0.12] text-[#F4F5F2] border border-white/[0.15]'
                    : 'bg-[#0D0F12] text-zinc-400 border border-white/[0.06] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Datasets Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
            <RefreshCw className="w-5 h-5 animate-spin text-[#5B82FF]" />
            <span className="text-xs font-mono">Loading repository registry...</span>
          </div>
        ) : datasets.length === 0 ? (
          <div className="py-20 text-center border rounded-2xl border-dashed border-white/[0.08] bg-[#0D0F12]">
            <p className="text-sm font-medium text-zinc-400">No repositories found matching your query.</p>
            <button
              onClick={() => {
                setCategory('all');
                setSearch('');
              }}
              className="mt-3 text-xs text-[#5B82FF] hover:underline font-mono"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets.map((d) => (
              <div
                key={d.id}
                onClick={() => navigate(`/datasets/${d.slug}`)}
                className="group cursor-pointer p-6 rounded-2xl border border-white/[0.08] bg-[#0D0F12] hover:border-[#5B82FF]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-400 border border-white/[0.08] uppercase">
                      {d.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5B82FF] font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5B82FF]"></span>
                      {d.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#F4F5F2] font-display group-hover:text-[#5B82FF] transition-colors mb-2">
                    {d.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-6 font-sans">
                    {d.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] space-y-2 font-sans">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Records Ingested:</span>
                    <span className="font-mono font-bold text-[#F4F5F2]">
                      {d.record_count.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Sync Cadence:</span>
                    <span className="font-mono text-zinc-300">{d.update_frequency}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>License:</span>
                    <span className="font-mono text-zinc-300 truncate max-w-[180px]">{d.source_license}</span>
                  </div>

                  <div className="pt-3 flex items-center justify-between text-xs font-semibold text-[#5B82FF]">
                    <span>Explore Schema & Endpoints</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
};

