import React from 'react';
import { ShieldCheck, Activity, Terminal } from 'lucide-react';
import { LabWayLogo } from './LabWayLogo';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#070809] text-zinc-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3 md:col-span-1">
            <LabWayLogo size="md" />
            <p className="text-xs leading-relaxed text-zinc-400">
              Reliable data infrastructure. One clean API. Automated extraction, validation, and programmatic distribution for engineering teams.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-[#5B82FF] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#5B82FF] animate-pulse"></span>
              All Systems Operational (99.99% SLA)
            </div>
          </div>

          <div>
            <h4 className="font-semibold font-display text-[#F4F5F2] text-xs uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/datasets')} className="hover:text-[#F4F5F2] transition-colors">Dataset Catalog</button></li>
              <li><button onClick={() => navigate('/pricing')} className="hover:text-[#F4F5F2] transition-colors">Pricing & Plans</button></li>
              <li><button onClick={() => navigate('/docs')} className="hover:text-[#F4F5F2] transition-colors">Developer Documentation</button></li>
              <li><button onClick={() => navigate('/#pipeline')} className="hover:text-[#F4F5F2] transition-colors">Ingestion Pipeline</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold font-display text-[#F4F5F2] text-xs uppercase tracking-wider mb-3">Datasets</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/datasets/opportunities')} className="hover:text-[#F4F5F2] transition-colors">Public Opportunities & RFPs</button></li>
              <li><button onClick={() => navigate('/datasets/corporate-entities')} className="hover:text-[#F4F5F2] transition-colors">Corporate Registrations (LEI)</button></li>
              <li><button onClick={() => navigate('/datasets/environmental-monitoring')} className="hover:text-[#F4F5F2] transition-colors">Environmental Telemetry</button></li>
              <li><button onClick={() => navigate('/datasets/open-patents')} className="hover:text-[#F4F5F2] transition-colors">Open IP & Patents</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold font-display text-[#F4F5F2] text-xs uppercase tracking-wider mb-3">Legal & Security</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /> Open Government License (OGDL)</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /> CC0 1.0 Public Domain</li>
              <li className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-zinc-400" /> API Terms & Metering Quotas</li>
              <li className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-zinc-400" /> Data Licensing Policy</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 LabWay Inc. Reliable Data Infrastructure.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="/dataflow-api-complete.zip"
              download="dataflow-api-complete.zip"
              className="inline-flex items-center gap-1 text-[#5B82FF] hover:underline font-mono"
            >
              Project Archive (.ZIP)
            </a>
            <span>•</span>
            <a
              href="/COMPLETE_SOURCE_CODE.txt"
              download="COMPLETE_SOURCE_CODE.txt"
              className="inline-flex items-center gap-1 hover:text-[#F4F5F2] hover:underline font-mono"
            >
              Source Text (.txt)
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
