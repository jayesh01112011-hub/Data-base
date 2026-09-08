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
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Navbar currentPath="/datasets" navigate={navigate} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
            <Database className="w-4 h-4" />
            <span>DATASET CATALOG & MARKETPLACE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Certified Public Datasets
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Normalized, legally verified public domain and licensed datasets, ingested continuously and queryable via high-performance REST APIs.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search datasets by keyword, name, or metadata..."
              className="w-full pl-9 pr-24 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium transition-colors"
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
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  category === cat.id
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Datasets Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
            <span className="text-xs">Loading dataset catalogue...</span>
          </div>
        ) : datasets.length === 0 ? (
          <div className="py-20 text-center border rounded-xl border-dashed border-zinc-300 dark:border-zinc-800">
            <p className="text-sm font-medium text-zinc-500">No datasets found matching your search.</p>
            <button
              onClick={() => {
                setCategory('all');
                setSearch('');
              }}
              className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
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
                className="group cursor-pointer p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 uppercase">
                      {d.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {d.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2">
                    {d.name}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-6">
                    {d.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Records Ingested:</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {d.record_count.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Sync Cadence:</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{d.update_frequency}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>License:</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 truncate max-w-[180px]">{d.source_license}</span>
                  </div>

                  <div className="pt-3 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Explore Schema & API</span>
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
