import React, { useState } from 'react';
import { Play, Copy, Check, Terminal, RefreshCw, Layers } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ApiConsoleProps {
  initialEndpoint?: string;
  initialCategory?: string;
}

export const ApiConsole: React.FC<ApiConsoleProps> = ({
  initialEndpoint = '/api/v1/opportunities',
  initialCategory = 'manufacturing'
}) => {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [limit, setLimit] = useState<number>(3);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number>(200);
  const [responseTime, setResponseTime] = useState<number>(24);
  const [responseData, setResponseData] = useState<any>(null);

  const executeQuery = async () => {
    setLoading(true);
    const start = performance.now();

    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedLocation && selectedLocation !== 'all') params.set('location', selectedLocation);
      if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus);
      params.set('limit', String(limit));

      const res = await fetch(`${initialEndpoint}?${params.toString()}`, {
        headers: {
          'x-dataflow-demo': 'true'
        }
      });

      const end = performance.now();
      const data = await res.json();

      setResponseStatus(res.status);
      setResponseTime(Math.round(end - start));
      setResponseData(data);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseData({ success: false, error: err.message || 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  React.useEffect(() => {
    executeQuery();
  }, [selectedCategory, selectedLocation, selectedStatus, limit]);

  const curlCommand = `curl -X GET "https://api.dataflow.dev${initialEndpoint}?category=${selectedCategory}&limit=${limit}" \\
  -H "Authorization: Bearer df_live_your_api_key"`;

  const copyCommand = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    showToast('cURL command copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl overflow-hidden font-mono text-xs">
      {/* Console Header Bar */}
      <div className="px-4 py-3 bg-zinc-950/80 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-zinc-400 font-medium ml-2 text-xs flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-zinc-500" />
            Live Query Console
          </span>
        </div>

        {/* Live response badge */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
            responseStatus === 200 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
          }`}>
            {responseStatus} OK
          </span>
          <span className="text-zinc-500 text-[11px]">{responseTime}ms</span>
          <button
            onClick={copyCommand}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Copy cURL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Query Builder Controls */}
      <div className="p-3 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center gap-2">
        <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[11px] border border-emerald-500/30">
          GET
        </span>
        <span className="text-zinc-300 font-mono text-xs">/api/v1/opportunities?</span>

        <div className="flex items-center gap-1.5">
          <label className="text-zinc-400 text-[11px]">category=</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="manufacturing">manufacturing</option>
            <option value="clean-energy">clean-energy</option>
            <option value="technology">technology</option>
            <option value="infrastructure">infrastructure</option>
            <option value="healthcare">healthcare</option>
            <option value="all">all</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-zinc-400 text-[11px]">location=</label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">all</option>
            <option value="US-CA">US-CA</option>
            <option value="DE-BER">DE-BER</option>
            <option value="UK-LON">UK-LON</option>
            <option value="IN-MH">IN-MH</option>
            <option value="SG-SIN">SG-SIN</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-zinc-400 text-[11px]">limit=</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
          </select>
        </div>

        <button
          onClick={executeQuery}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          Send
        </button>
      </div>

      {/* Real Response Output */}
      <div className="p-4 max-h-72 overflow-y-auto bg-zinc-950 font-mono text-[12px] leading-relaxed text-zinc-300 scrollbar-thin scrollbar-thumb-zinc-800">
        {loading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-zinc-500">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Fetching live records from SQLite repository...</span>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap">
            {responseData ? JSON.stringify(responseData, null, 2) : 'No response'}
          </pre>
        )}
      </div>
    </div>
  );
};
