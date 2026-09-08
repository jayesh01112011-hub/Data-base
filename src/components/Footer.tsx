import React from 'react';
import { Database, ShieldCheck, Activity, Terminal } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950">
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">DataFlow API</span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              The high-performance structured public data infrastructure for modern engineering teams. Ingested, normalized, and metered automatically.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational (99.99% SLA)
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/datasets')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Dataset Catalog</button></li>
              <li><button onClick={() => navigate('/pricing')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Pricing & Plans</button></li>
              <li><button onClick={() => navigate('/docs')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Developer Documentation</button></li>
              <li><button onClick={() => navigate('/#pipeline')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Ingestion Pipeline</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs uppercase tracking-wider mb-3">Datasets</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/datasets/opportunities')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Public Opportunities & RFPs</button></li>
              <li><button onClick={() => navigate('/datasets/corporate-entities')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Corporate Registrations (LEI)</button></li>
              <li><button onClick={() => navigate('/datasets/environmental-monitoring')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Environmental Telemetry</button></li>
              <li><button onClick={() => navigate('/datasets/open-patents')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Open IP & Patents</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs uppercase tracking-wider mb-3">Legal & Security</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /> Open Government License (OGDL)</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /> CC0 1.0 Public Domain</li>
              <li className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-zinc-400" /> API Terms & Metering Quotas</li>
              <li className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-zinc-400" /> Data Licensing Policy</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-500">
          <p>© 2026 DataFlow API Inc. Production Full-Stack Architecture.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="/dataflow-api-complete.zip"
              download="dataflow-api-complete.zip"
              className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-mono"
            >
              Download Project ZIP (Complete)
            </a>
            <span>•</span>
            <a
              href="/COMPLETE_SOURCE_CODE.txt"
              download="COMPLETE_SOURCE_CODE.txt"
              className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200 hover:underline font-mono"
            >
              Raw Source Text (.txt)
            </a>
            <span>•</span>
            <span className="font-mono">v1.0.0-release</span>
            <span>•</span>
            <span>REST / JSON / OCDS Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
