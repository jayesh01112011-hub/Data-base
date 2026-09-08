import React, { useState } from 'react';
import {
  BookOpen,
  Key,
  Database,
  Layers,
  ShieldAlert,
  Terminal,
  Code2,
  Copy,
  Check,
  Zap,
  Activity,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ApiConsole } from '../components/ApiConsole';
import { useToast } from '../context/ToastContext';

interface DocsPageProps {
  navigate: (path: string) => void;
}

export const DocsPage: React.FC<DocsPageProps> = ({ navigate }) => {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState('intro');
  const [copiedKey, setCopiedKey] = useState(false);

  const sections = [
    { id: 'intro', label: 'Introduction', icon: BookOpen },
    { id: 'auth', label: 'Authentication', icon: Key },
    { id: 'endpoints', label: 'API Endpoints', icon: Layers },
    { id: 'pagination', label: 'Pagination & Sorting', icon: Database },
    { id: 'rate-limits', label: 'Rate Limits & Metering', icon: Activity },
    { id: 'errors', label: 'Error Handling', icon: ShieldAlert },
    { id: 'console', label: 'Interactive Gateway', icon: Terminal },
    { id: 'examples', label: 'Code Examples', icon: Code2 }
  ];

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(true);
    showToast('Copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070809] text-[#F4F5F2] flex flex-col transition-colors">
      <Navbar currentPath="/docs" navigate={navigate} />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Docs Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 space-y-1 font-sans">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
              Infrastructure Docs
            </div>
            {sections.map((sec) => {
              const Icon = sec.icon;
              const active = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-white/[0.1] text-[#F4F5F2] shadow-sm font-semibold border border-white/[0.1]'
                      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#5B82FF]' : 'text-zinc-500'}`} />
                  <span>{sec.label}</span>
                </button>
              );
            })}

            <div className="pt-6 border-t border-white/[0.08] mt-6">
              <button
                onClick={() => navigate('/dashboard/api-keys')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[#5B82FF]/30 bg-[#5B82FF]/10 text-[#5B82FF] text-xs font-semibold hover:bg-[#5B82FF]/20 transition-colors"
              >
                <span>Generate API Key</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 max-w-3xl space-y-10 pb-16 font-sans">
          {activeSection === 'intro' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#F4F5F2] font-display mb-2">
                  LabWay Infrastructure Overview
                </h1>
                <p className="text-sm text-zinc-400 leading-relaxed font-sans">
                  The LabWay platform provides direct, low-latency programmatic access to continuously updated, structured public and licensed datasets. Our automated ingestion engine continuously extracts records from upstream legal portals, normalizes data into standardized JSON, validates integrity, and partitions storage for immediate API querying.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0D0F12] text-xs space-y-2 font-mono">
                <div className="text-zinc-500 text-[11px] uppercase">Base Production Gateway URL</div>
                <div className="flex items-center justify-between font-bold text-[#5B82FF] text-sm">
                  <span>https://api.labway.dev/api/v1</span>
                  <button
                    onClick={() => copyText('https://api.labway.dev/api/v1')}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-[#5B82FF]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-[#F4F5F2] font-display">System Guarantees</h3>
                <ul className="space-y-2 text-xs text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5B82FF] mt-1.5 shrink-0"></span>
                    <span><strong className="text-[#F4F5F2]">100% Legal & Attributed:</strong> Provenance tracked back to public domain licenses (OGDL 2.0, CC0 1.0, ODbL).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5B82FF] mt-1.5 shrink-0"></span>
                    <span><strong className="text-[#F4F5F2]">Deterministic Schemas:</strong> JSON responses conform to strict schema types with ISO 8601 timestamps.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5B82FF] mt-1.5 shrink-0"></span>
                    <span><strong className="text-[#F4F5F2]">Continuous Ingestion:</strong> Sync intervals between 5 minutes and 24 hours.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'auth' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight text-[#F4F5F2] font-display">
                Authentication
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                All requests to the LabWay API must be authenticated using an API key passed in either the <code className="px-1.5 py-0.5 rounded bg-[#12151A] font-mono text-[#5B82FF]">Authorization: Bearer &lt;KEY&gt;</code> or <code className="px-1.5 py-0.5 rounded bg-[#12151A] font-mono text-[#5B82FF]">x-api-key: &lt;KEY&gt;</code> header.
              </p>

              <div className="rounded-2xl border border-white/[0.08] bg-[#0D0F12] text-[#F4F5F2] p-4 font-mono text-xs space-y-2">
                <div className="text-zinc-500"># Header Example</div>
                <div className="text-[#5B82FF]">Authorization: Bearer df_live_xxxxxxxxxxxxxxxxx</div>
              </div>

              <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0D0F12] text-xs text-zinc-400 space-y-1">
                <div className="font-bold text-[#5B82FF] font-mono">Security Notice</div>
                <p>
                  API keys carry full query access and deduct from your monthly quota. Never commit your secret keys to public client-side JavaScript repositories or GitHub. Store them securely in backend server environment variables.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'endpoints' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight text-[#F4F5F2] font-display">
                Endpoints Reference
              </h1>

              <div className="space-y-6">
                <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0D0F12] space-y-3">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-[#5B82FF]/20 text-[#5B82FF] font-bold">GET</span>
                    <span className="font-bold text-[#F4F5F2]">/api/v1/opportunities</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Query active public procurement solicitations, government tenders, and institutional contracts.
                  </p>
                  <div className="text-xs font-mono space-y-1 text-zinc-500">
                    <div>Parameters: <code>category</code>, <code>location</code>, <code>status</code>, <code>min_value</code>, <code>max_value</code>, <code>sort_by</code>, <code>order</code>, <code>page</code>, <code>limit</code></div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0D0F12] space-y-3">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-[#5B82FF]/20 text-[#5B82FF] font-bold">GET</span>
                    <span className="font-bold text-[#F4F5F2]">/api/v1/opportunities/:id</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Fetch a single opportunity record by its unique system ID or external procurement identifier.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0D0F12] space-y-3">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-[#5B82FF]/20 text-[#5B82FF] font-bold">GET</span>
                    <span className="font-bold text-[#F4F5F2]">/api/datasets</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    List all available datasets in the catalog with record counts, sync cadences, and schema summaries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'pagination' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight text-[#F4F5F2] font-display">
                Pagination, Filtering & Sorting
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Collection endpoints accept query parameters for predictable offset pagination and field filtering.
              </p>

              <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#0D0F12]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070809] border-b border-white/[0.08] font-mono text-zinc-500">
                    <tr>
                      <th className="px-4 py-2.5">Parameter</th>
                      <th className="px-4 py-2.5">Default</th>
                      <th className="px-4 py-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-[#5B82FF]">page</td>
                      <td className="px-4 py-2.5 font-mono text-zinc-400">1</td>
                      <td className="px-4 py-2.5">Page number (1-indexed)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-[#5B82FF]">limit</td>
                      <td className="px-4 py-2.5 font-mono text-zinc-400">20</td>
                      <td className="px-4 py-2.5">Max records per page (max 100)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-[#5B82FF]">sort_by</td>
                      <td className="px-4 py-2.5 font-mono text-zinc-400">created_at</td>
                      <td className="px-4 py-2.5">Sort column (created_at, value, deadline)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-[#5B82FF]">order</td>
                      <td className="px-4 py-2.5 font-mono text-zinc-400">desc</td>
                      <td className="px-4 py-2.5">Order direction ('asc' or 'desc')</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'rate-limits' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight text-[#F4F5F2] font-display">
                Rate Limits & Quota Metering
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Requests are metered across two independent constraints: monthly volume quota and per-second burst throughput.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0D0F12]">
                  <h4 className="text-xs font-bold uppercase font-mono text-zinc-500 mb-1">Burst Rate Limit</h4>
                  <p className="text-sm font-semibold text-[#F4F5F2]">Up to 200 req/sec</p>
                  <p className="text-xs text-zinc-400 mt-1">If exceeded, returns HTTP 429 Too Many Requests with <code className="font-mono text-[#5B82FF]">Retry-After: 1</code> header.</p>
                </div>
                <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0D0F12]">
                  <h4 className="text-xs font-bold uppercase font-mono text-zinc-500 mb-1">Monthly Quota</h4>
                  <p className="text-sm font-semibold text-[#F4F5F2]">1k - 500k req/month</p>
                  <p className="text-xs text-zinc-400 mt-1">Metered accurately in persistent SQLite database. Upgrades apply immediately.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'errors' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight text-[#F4F5F2] font-display">
                Error Handling
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                The API returns standard HTTP status codes and structured JSON errors.
              </p>

              <div className="rounded-2xl border border-white/[0.08] bg-[#0D0F12] p-4 font-mono text-xs text-zinc-300">
                <pre>{`{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit of 20 requests per second exceeded. Please retry after 1s.",
    "retry_after_seconds": 1
  }
}`}</pre>
              </div>
            </div>
          )}

          {activeSection === 'console' && (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-[#F4F5F2] font-display">
                Live Interactive API Gateway Tester
              </h1>
              <p className="text-sm text-zinc-400">
                Execute live requests against the local data repository in real time.
              </p>
              <ApiConsole initialEndpoint="/api/v1/opportunities" />
            </div>
          )}

          {activeSection === 'examples' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight text-[#F4F5F2] font-display">
                SDK & Code Examples
              </h1>
              <p className="text-sm text-zinc-400">
                Sample code for querying public procurement datasets.
              </p>
              <div className="rounded-2xl border border-white/[0.08] bg-[#0D0F12] p-5 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
                <div className="text-[#5B82FF] mb-2"># Python 3 example</div>
                <pre>{`import requests

API_KEY = "df_live_xxxxxxxxxxxxxxxxx"
url = "https://api.labway.dev/api/v1/opportunities"

response = requests.get(
    url,
    headers={"Authorization": f"Bearer {API_KEY}"},
    params={"category": "clean-energy", "limit": 5}
)

data = response.json()
for item in data.get("data", []):
    print(f"[{item['category']}] {item['title']} - {item['value']} {item['currency']}")`}</pre>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer navigate={navigate} />
    </div>
  );
};

