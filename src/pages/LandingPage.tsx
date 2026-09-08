import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Database,
  Code2,
  CheckCircle2,
  RefreshCw,
  Server,
  Layers,
  ChevronDown,
  Copy,
  Check,
  BarChart3,
  ShieldCheck,
  Cpu,
  Radio,
  FileCheck,
  Workflow
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ApiConsole } from '../components/ApiConsole';
import { api } from '../services/apiClient';
import { Dataset, Plan } from '../types';
import { useToast } from '../context/ToastContext';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { showToast } = useToast();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'python' | 'js'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.datasets.list().catch(() => ({ success: true, datasets: [] })),
      api.billing.getPlans().catch(() => ({ success: true, plans: [] }))
    ]).then(([dsRes, planRes]) => {
      if (dsRes.datasets) setDatasets(dsRes.datasets);
      if (planRes.plans) setPlans(planRes.plans);
      setLoading(false);
    });
  }, []);

  const codeSnippets = {
    curl: `curl -X GET "https://api.labway.dev/api/v1/opportunities?category=manufacturing&status=active" \\
  -H "Authorization: Bearer df_live_xxxxxxxxxxxxxxxxx" \\
  -H "Accept: application/json"`,
    python: `import requests

url = "https://api.labway.dev/api/v1/opportunities"
headers = {
    "Authorization": "Bearer df_live_xxxxxxxxxxxxxxxxx",
    "Accept": "application/json"
}
params = {
    "category": "manufacturing",
    "status": "active",
    "limit": 10
}

response = requests.get(url, headers=headers, params=params)
data = response.json()
print(f"Retrieved {len(data.get('data', []))} records from LabWay infrastructure")`,
    js: `import axios from 'axios';

const { data } = await axios.get('https://api.labway.dev/api/v1/opportunities', {
  headers: {
    Authorization: 'Bearer df_live_xxxxxxxxxxxxxxxxx',
    Accept: 'application/json'
  },
  params: {
    category: 'manufacturing',
    status: 'active',
    limit: 10
  }
});

console.log('LabWay records:', data.data);`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopiedCode(true);
    showToast('Code snippet copied to clipboard');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const pipelineSteps = [
    { step: '01', node: 'Source', desc: 'Licensed public registries & OCDS standards', status: 'Continuous' },
    { step: '02', node: 'Ingestion', desc: 'Automated extraction workers & webhooks', status: 'Automated' },
    { step: '03', node: 'Validation', desc: 'Schema checks, sanitization & deduplication', status: 'Strict' },
    { step: '04', node: 'Database', desc: 'Indexed, partitioned relational storage', status: 'Persistent' },
    { step: '05', node: 'API', desc: 'Sub-25ms global edge routing & metering', status: 'Active' },
    { step: '06', node: 'Your App', desc: 'Deterministic JSON payloads & typing', status: 'Ready' }
  ];

  const faqs = [
    {
      q: 'Where does LabWay source its datasets from?',
      a: 'LabWay ingests solely from certified, legally licensed public domain databases, open government portals (such as OCDS feeds), international registries, and authorized open standards. All datasets carry verified licensing credentials (e.g. OGDL 2.0, CC0 1.0 Universal, ODbL).'
    },
    {
      q: 'How frequently are datasets updated?',
      a: 'Update intervals range from every 5 minutes (for ambient sensor telemetry) and 15 minutes (for high-velocity public procurement solicitations) to daily for patent records. All ingestion is managed by automated validation and normalization workers.'
    },
    {
      q: 'How does usage metering and rate limiting work?',
      a: 'Every request authenticated by your API key is metered in real time down to milliseconds. Quotas and rate limits are enforced automatically based on your active subscription plan with transparent headers (Retry-After, X-Total-Count).'
    },
    {
      q: 'Can I start using LabWay for free?',
      a: 'Yes. Our Free tier includes 1,000 requests per month with 5 requests/sec throughput. No credit card is required to register and generate your first API key.'
    },
    {
      q: 'Are custom enterprise datasets available?',
      a: 'Yes, on the Business plan we provide dedicated ingestion worker pipelines, custom schema definitions, and custom licensed dataset agreements.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070809] text-[#F4F5F2] selection:bg-[#5B82FF]/30 selection:text-white">
      <Navbar currentPath="/" navigate={navigate} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 border-b border-white/[0.08] bg-tech-grid">
        {/* Subtle Matte-Blue Radial Illumination */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-radial-illumination pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Infrastructure Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg text-xs font-mono bg-[#12151A] border border-white/[0.08] text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-[#5B82FF] animate-pulse"></span>
              <span>Autonomous Ingestion Engine Active • 99.99% Operational</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F4F5F2] leading-[1.08] font-display">
              Reliable data infrastructure.
              <br />
              <span className="text-[#5B82FF]">One clean API.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal max-w-2xl mx-auto font-sans">
              Programmatic, normalized access to high-velocity public domain data. Ingested, validated, and metered for mission-critical software.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => navigate('/datasets')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-[#5B82FF] hover:bg-[#6F92FF] text-white transition-all shadow-[0_1px_15px_rgba(91,130,255,0.25)] active:scale-[0.98]"
              >
                Explore Datasets
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/docs')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-[#0D0F12] hover:bg-[#12151A] text-zinc-200 border border-white/[0.1] hover:border-white/[0.2] transition-colors"
              >
                API Documentation
              </button>
            </div>
          </div>

          {/* Live Interactive API Console */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="mb-2.5 flex items-center justify-between px-1 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5B82FF]"></span>
                LIVE GATEWAY TERMINAL — RUNS REAL BACKEND QUERIES
              </span>
              <span className="text-zinc-500">PostgreSQL / SQLite Storage Engine</span>
            </div>
            <ApiConsole initialCategory="manufacturing" />
          </div>
        </div>
      </section>

      {/* Trust / Infrastructure Primitives Section */}
      <section id="products" className="py-24 bg-[#0D0F12] border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F5F2] font-display">
              Infrastructure Primitives
            </h2>
            <p className="mt-3 text-sm text-zinc-400 font-sans">
              Architected with rigid schema enforcement, legal licensing provenance, and edge developer ergonomics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#12151A] hover:border-[#5B82FF]/40 transition-all group">
              <div className="w-9 h-9 rounded-lg bg-[#5B82FF]/10 text-[#5B82FF] flex items-center justify-center mb-5 border border-[#5B82FF]/20 group-hover:bg-[#5B82FF]/15 transition-colors">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F4F5F2] font-display mb-2">Structured Data</h3>
              <p className="text-xs leading-relaxed text-zinc-400 font-sans">
                Rigid schemas with validated field types, normalized taxonomy, and ISO standards so your downstream parsers never crash.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#12151A] hover:border-[#5B82FF]/40 transition-all group">
              <div className="w-9 h-9 rounded-lg bg-[#5B82FF]/10 text-[#5B82FF] flex items-center justify-center mb-5 border border-[#5B82FF]/20 group-hover:bg-[#5B82FF]/15 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F4F5F2] font-display mb-2">Automated Updates</h3>
              <p className="text-xs leading-relaxed text-zinc-400 font-sans">
                Continuous workers ingest, validate, and deduplicate records on scheduled cadences directly into edge databases.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#12151A] hover:border-[#5B82FF]/40 transition-all group">
              <div className="w-9 h-9 rounded-lg bg-[#5B82FF]/10 text-[#5B82FF] flex items-center justify-center mb-5 border border-[#5B82FF]/20 group-hover:bg-[#5B82FF]/15 transition-colors">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F4F5F2] font-display mb-2">Developer-Friendly APIs</h3>
              <p className="text-xs leading-relaxed text-zinc-400 font-sans">
                Predictable REST endpoints with parameterized filtering, sorting, pagination, and deterministic JSON responses.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#12151A] hover:border-[#5B82FF]/40 transition-all group">
              <div className="w-9 h-9 rounded-lg bg-[#5B82FF]/10 text-[#5B82FF] flex items-center justify-center mb-5 border border-[#5B82FF]/20 group-hover:bg-[#5B82FF]/15 transition-colors">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F4F5F2] font-display mb-2">Usage-Based Access</h3>
              <p className="text-xs leading-relaxed text-zinc-400 font-sans">
                Real-time request metering down to the millisecond, automated quota tracking, and transparent billing thresholds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Infrastructure Pipeline Diagram */}
      <section id="pipeline" className="py-24 border-b border-white/[0.08] bg-[#070809]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F5F2] font-display">
              Data Pipeline Architecture
            </h2>
            <p className="mt-3 text-sm text-zinc-400 font-sans">
              End-to-end automated extraction, normalization, and delivery pipeline.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-center">
            {pipelineSteps.map((s, idx) => (
              <div
                key={s.step}
                className="relative p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12] flex flex-col justify-between hover:border-[#5B82FF]/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-medium text-[#5B82FF]">
                      {s.step}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-400 border border-white/[0.08]">
                      {s.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#F4F5F2] font-display mb-1.5">{s.node}</h4>
                  <p className="text-[11px] text-zinc-400 leading-tight font-sans">{s.desc}</p>
                </div>
                {idx < 5 && (
                  <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-zinc-600 font-mono text-sm">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dataset Preview Section */}
      <section className="py-24 bg-[#0D0F12] border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F5F2] font-display">
                Available Datasets
              </h2>
              <p className="mt-2 text-sm text-zinc-400 font-sans">
                Explore verified, continuously synchronized public data collections ready for query.
              </p>
            </div>
            <button
              onClick={() => navigate('/datasets')}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#5B82FF] hover:text-[#6F92FF] hover:underline"
            >
              Browse complete catalog
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {datasets.map((d) => (
              <div
                key={d.id}
                className="p-5 rounded-xl border border-white/[0.08] bg-[#12151A] flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:border-[#5B82FF]/50 hover:shadow-[0_4px_24px_rgba(91,130,255,0.08)] group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                      {d.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#5B82FF]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5B82FF]"></span>
                      {d.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-[#F4F5F2] font-display mb-1.5 line-clamp-1 group-hover:text-white">
                    {d.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mb-4 line-clamp-2 leading-relaxed font-sans">
                    {d.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-sans">
                    <span>Records:</span>
                    <span className="font-mono font-medium text-[#F4F5F2]">
                      {d.record_count.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-sans">
                    <span>Frequency:</span>
                    <span className="font-mono text-zinc-300">{d.update_frequency}</span>
                  </div>
                  <div className="pt-1">
                    <code className="text-[11px] font-mono text-[#5B82FF] block truncate">
                      {d.api_endpoint}
                    </code>
                  </div>
                  <button
                    onClick={() => navigate(`/datasets/${d.slug}`)}
                    className="w-full mt-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#0D0F12] hover:bg-[#181C22] text-[#F4F5F2] border border-white/[0.1] hover:border-white/[0.2] transition-colors"
                  >
                    View Dataset
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Code Section */}
      <section className="py-24 border-b border-white/[0.08] bg-[#070809]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F5F2] font-display">
              Engineered for Developers
            </h2>
            <p className="mt-3 text-sm text-zinc-400 font-sans">
              Standard HTTP client consumption. Zero proprietary SDK locks.
            </p>
          </div>

          <div className="max-w-3xl mx-auto rounded-xl border border-white/[0.08] bg-[#0D0F12] overflow-hidden shadow-2xl">
            {/* Tabs */}
            <div className="px-4 py-2.5 bg-[#070809] border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(['curl', 'python', 'js'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                      activeCodeTab === tab
                        ? 'bg-white/[0.08] text-white border border-white/[0.12]'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tab === 'curl' ? 'cURL' : tab === 'python' ? 'Python' : 'JavaScript'}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#5B82FF]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-5 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed bg-[#0D0F12]">
              <code>{codeSnippets[activeCodeTab]}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Pricing Section (Fetched from real backend) */}
      <section id="pricing" className="py-24 bg-[#0D0F12] border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F5F2] font-display">
              Transparent Infrastructure Pricing
            </h2>
            <p className="mt-3 text-sm text-zinc-400 font-sans">
              Provisioned on the backend metering engine. Upgrade, downgrade, or scale quotas anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p) => {
              const isGrowth = p.id === 'growth';
              return (
                <div
                  key={p.id}
                  className={`p-6 rounded-xl border flex flex-col justify-between transition-all ${
                    isGrowth
                      ? 'border-[#5B82FF] bg-[#12151A] shadow-[0_4px_30px_rgba(91,130,255,0.12)] relative'
                      : 'border-white/[0.08] bg-[#0D0F12]'
                  }`}
                >
                  {isGrowth && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold bg-[#5B82FF] text-white shadow-sm">
                      Recommended
                    </span>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F4F5F2] font-display">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400 min-h-[32px] font-sans">
                      {p.description}
                    </p>

                    <div className="mt-4 mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-[#F4F5F2] font-display">
                          ₹{p.price_inr.toLocaleString()}
                        </span>
                        <span className="text-xs text-zinc-400">/month</span>
                      </div>
                      <p className="text-[11px] font-mono text-[#5B82FF] mt-1.5">
                        {p.monthly_quota.toLocaleString()} requests • {p.rate_limit_rps} req/sec
                      </p>
                    </div>

                    <ul className="space-y-2.5 text-xs text-zinc-300 mb-6 font-sans">
                      {p.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#5B82FF] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => navigate('/register')}
                    className={`w-full py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isGrowth
                        ? 'bg-[#5B82FF] hover:bg-[#6F92FF] text-white shadow-sm'
                        : 'bg-[#12151A] hover:bg-[#181C22] text-[#F4F5F2] border border-white/[0.1]'
                    }`}
                  >
                    {p.price_inr === 0 ? 'Start Free' : `Select ${p.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-b border-white/[0.08] bg-[#070809]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F5F2] font-display">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-zinc-400 font-sans">
              Clear specifications regarding data licensing, schema guarantees, and usage quotas.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = faqOpen === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/[0.08] bg-[#0D0F12] overflow-hidden"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-sm font-medium text-[#F4F5F2] hover:bg-white/[0.03] transition-colors font-display"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-white/[0.05] font-sans">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-[#0D0F12] text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-[#F4F5F2]">
            Start building with LabWay
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed font-sans">
            Provision your production API key in seconds. 1,000 monthly requests on the free tier, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-medium bg-[#5B82FF] hover:bg-[#6F92FF] text-white transition-all shadow-[0_1px_15px_rgba(91,130,255,0.25)]"
            >
              Get Started for Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/docs')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-medium border border-white/[0.1] hover:bg-white/[0.04] text-zinc-300 transition-colors"
            >
              Explore API Reference
            </button>
          </div>
        </div>
      </section>

      <Footer navigate={navigate} />
    </div>
  );
};

