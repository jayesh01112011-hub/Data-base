import React, { useState } from 'react';
import { Play, Copy, Check, Terminal, RefreshCw } from 'lucide-react';
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

  const curlCommand = `curl -X GET "https://api.labway.dev${initialEndpoint}?category=${selectedCategory}&limit=${limit}" \\
  -H "Authorization: Bearer df_live_xxxxxxxxxxxxxxxxx"`;

  const copyCommand = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    showToast('cURL command copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-xl border border-white/[0.08] bg-[#0D0F12] text-[#F4F5F2] shadow-2xl overflow-hidden font-mono text-xs">
      {/* Console Header Bar */}
      <div className="px-4 py-3 bg-[#070809] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#5B82FF] inline-block"></span>
          </div>
          <span className="text-zinc-400 font-medium ml-2 text-xs flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#5B82FF]" />
            LabWay Interactive Gateway Tester
          </span>
        </div>

        {/* Live response badge */}
        <div className="flex items-center gap-2.5">
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
            responseStatus === 200
              ? 'bg-[#5B82FF]/15 text-[#5B82FF] border border-[#5B82FF]/30'
              : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
          }`}>
            {responseStatus} OK
          </span>
          <span className="text-zinc-500 text-[11px]">{responseTime}ms</span>
          <button
            onClick={copyCommand}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Copy cURL snippet"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#5B82FF]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Query Builder Controls */}
      <div className="p-3 bg-[#12151A] border-b border-white/[0.08] flex flex-wrap items-center gap-2.5">
        <span className="px-2 py-0.5 rounded bg-[#5B82FF]/20 text-[#5B82FF] font-semibold text-[11px] border border-[#5B82FF]/40">
          GET
        </span>
        <span className="text-zinc-300 font-mono text-xs">/api/v1/opportunities?</span>

        <div className="flex items-center gap-1.5">
          <label className="text-zinc-400 text-[11px]">category=</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0D0F12] border border-white/[0.1] rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-[#5B82FF]"
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
            className="bg-[#0D0F12] border border-white/[0.1] rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-[#5B82FF]"
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
            className="bg-[#0D0F12] border border-white/[0.1] rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-[#5B82FF]"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
          </select>
        </div>

        <button
          onClick={executeQuery}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#5B82FF] hover:bg-[#6F92FF] text-white font-medium text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          Execute
        </button>
      </div>

      {/* Real Response Output */}
      <div className="p-4 max-h-72 overflow-y-auto bg-[#070809] font-mono text-[12px] leading-relaxed text-zinc-300">
        {loading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-zinc-500">
            <RefreshCw className="w-4 h-4 animate-spin text-[#5B82FF]" />
            <span>Querying verified dataset repository...</span>
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

