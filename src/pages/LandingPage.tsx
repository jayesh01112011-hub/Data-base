import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Database,
  Code2,
  CheckCircle2,
  Zap,
  ShieldCheck,
  RefreshCw,
  Server,
  Layers,
  Sparkles,
  ChevronDown,
  Copy,
  Check,
  BarChart3,
  Search,
  Globe,
  Lock
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
    curl: `curl -X GET "https://api.dataflow.dev/api/v1/opportunities?category=manufacturing&status=active" \\
  -H "Authorization: Bearer df_live_9a4f78e1c2d3b4a56789abcdef012345" \\
  -H "Accept: application/json"`,
    python: `import requests

url = "https://api.dataflow.dev/api/v1/opportunities"
headers = {
    "Authorization": "Bearer df_live_9a4f78e1c2d3b4a56789abcdef012345"
}
params = {
    "category": "manufacturing",
    "status": "active",
    "limit": 10
}

response = requests.get(url, headers=headers, params=params)
data = response.json()
print(f"Retrieved {len(data['data'])} structured opportunities")`,
    js: `import axios from 'axios';

const { data } = await axios.get('https://api.dataflow.dev/api/v1/opportunities', {
  headers: {
    Authorization: 'Bearer df_live_9a4f78e1c2d3b4a56789abcdef012345'
  },
  params: {
    category: 'manufacturing',
    status: 'active',
    limit: 10
  }
});

console.log('Opportunities:', data.data);`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopiedCode(true);
    showToast('Code snippet copied to clipboard');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const faqs = [
    {
      q: 'Where does DataFlow API source its data from?',
      a: 'DataFlow API ingests solely from certified, legally licensed public domain databases, open government portals (such as OCDS feeds), international registries, and authorized open standards. All datasets carry verified licensing credentials (e.g. OGDL 2.0, CC0 1.0 Universal, ODbL).'
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
      q: 'Can I start using the API for free?',
      a: 'Yes. Our Free tier includes 1,000 requests per month with 5 requests/sec throughput. No credit card is required to register and generate your first API key.'
    },
    {
      q: 'Are custom enterprise datasets available?',
      a: 'Yes, on the Business plan we provide dedicated ingestion worker pipelines, custom schema definitions, and custom licensed dataset agreements.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar currentPath="/" navigate={navigate} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Automated Continuous Ingestion Engine Active</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
              Reliable Data. <br className="hidden sm:inline" />
              <span className="text-emerald-600 dark:text-emerald-400">One API.</span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              Access structured, continuously updated datasets through simple developer-friendly APIs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/datasets')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md hover:shadow-emerald-600/20"
              >
                Explore APIs
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/docs')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 transition-colors"
              >
                View Documentation
              </button>
            </div>
          </div>

          {/* Live Interactive API Console */}
          <div className="mt-14 max-w-4xl mx-auto">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                LIVE QUERY DEMO — RUNS DIRECTLY AGAINST BACKEND DATABASE
              </span>
              <span className="text-xs text-zinc-500 font-mono">SQLite Ingestion Store</span>
            </div>
            <ApiConsole initialCategory="manufacturing" />
          </div>
        </div>
      </section>

      {/* Trusted Infrastructure Section */}
      <section id="products" className="py-20 bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Trusted Data Infrastructure
            </h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Built from the ground up for high reliability, strict licensing provenance, and seamless developer ergonomics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Structured Data</h3>
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Rigid schemas with validated field types, normalized taxonomy, and ISO standards so your application never breaks.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Automated Updates</h3>
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Continuous workers ingest, validate, and deduplicate records on scheduled cadences directly into edge databases.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Developer-Friendly APIs</h3>
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Intuitive REST endpoints with full filtering, sorting, pagination, and predictable JSON payloads.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Usage-Based Access</h3>
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Transparent request metering, precise analytics down to the millisecond, and flexible monthly quotas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Pipeline Section */}
      <section id="pipeline" className="py-20 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              How It Works
            </h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              The automated data lifecycle from upstream public sources to your production application.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            {[
              { step: '01', title: 'Source', desc: 'Licensed public & open data feeds' },
              { step: '02', title: 'Ingestion', desc: 'Automated polling & webhook workers' },
              { step: '03', title: 'Validation', desc: 'Schema checks & deduplication' },
              { step: '04', title: 'Database', desc: 'Indexed, partitioned storage' },
              { step: '05', title: 'API', desc: 'Low-latency REST gateway' },
              { step: '06', title: 'Your App', desc: 'Clean, reliable JSON consumption' }
            ].map((s, idx) => (
              <div
                key={s.step}
                className="relative p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {s.step}
                  </span>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1 mb-1.5">{s.title}</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">{s.desc}</p>
                </div>
                {idx < 5 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-zinc-400 dark:text-zinc-600 font-bold">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dataset Preview Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Available Datasets
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Explore actively maintained, normalized data collections ready for instant query.
              </p>
            </div>
            <button
              onClick={() => navigate('/datasets')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Browse all datasets
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {datasets.map((d) => (
              <div
                key={d.id}
                className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                      {d.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {d.status}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5 line-clamp-1">
                    {d.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
                    {d.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Records:</span>
                    <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                      {d.record_count.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Frequency:</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{d.update_frequency}</span>
                  </div>
                  <div className="pt-1">
                    <code className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 block truncate">
                      {d.api_endpoint}
                    </code>
                  </div>
                  <button
                    onClick={() => navigate(`/datasets/${d.slug}`)}
                    className="w-full mt-2 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
                  >
                    Explore Dataset
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Code Section */}
      <section className="py-20 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Built for Developers
            </h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Integrate in seconds with standard HTTP libraries across any language.
            </p>
          </div>

          <div className="max-w-3xl mx-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 overflow-hidden shadow-xl">
            {/* Tabs */}
            <div className="px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveCodeTab('curl')}
                  className={`px-3 py-1 rounded text-xs font-medium font-mono transition-colors ${
                    activeCodeTab === 'curl'
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setActiveCodeTab('python')}
                  className={`px-3 py-1 rounded text-xs font-medium font-mono transition-colors ${
                    activeCodeTab === 'python'
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Python
                </button>
                <button
                  onClick={() => setActiveCodeTab('js')}
                  className={`px-3 py-1 rounded text-xs font-medium font-mono transition-colors ${
                    activeCodeTab === 'js'
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  JavaScript
                </button>
              </div>

              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-5 font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed">
              <code>{codeSnippets[activeCodeTab]}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Pricing Section (Fetched dynamically from backend) */}
      <section id="pricing" className="py-20 bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Transparent, Usage-Based Pricing
            </h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Configured directly on the backend engine. Upgrade or downgrade anytime with instant quota adjustments.
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
                      ? 'border-emerald-500 bg-white dark:bg-zinc-900 shadow-md ring-1 ring-emerald-500 relative'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                  }`}
                >
                  {isGrowth && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-600 text-white shadow-sm">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 min-h-[32px]">
                      {p.description}
                    </p>

                    <div className="mt-4 mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-zinc-950 dark:text-white">
                          ₹{p.price_inr.toLocaleString()}
                        </span>
                        <span className="text-xs text-zinc-500">/month</span>
                      </div>
                      <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                        {p.monthly_quota.toLocaleString()} requests • {p.rate_limit_rps} req/sec
                      </p>
                    </div>

                    <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300 mb-6">
                      {p.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => navigate('/register')}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isGrowth
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {p.price_inr === 0 ? 'Start Free' : `Subscribe to ${p.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Clear answers regarding data sources, licensing, rate limits, and metering.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = faqOpen === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60">
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
      <section className="py-20 bg-zinc-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start building with DataFlow API
          </h2>
          <p className="text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Generate your first API key in seconds. 1,000 requests free every month, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all shadow-md"
            >
              Get Started for Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/docs')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border border-zinc-700 hover:bg-zinc-800 text-zinc-200 transition-colors"
            >
              Explore API Specs
            </button>
          </div>
        </div>
      </section>

      <Footer navigate={navigate} />
    </div>
  );
};
