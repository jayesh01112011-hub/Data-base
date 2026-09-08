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
    { id: 'console', label: 'Interactive Tester', icon: Terminal },
    { id: 'examples', label: 'Code Examples', icon: Code2 }
  ];

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(true);
    showToast('Copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Navbar currentPath="/docs" navigate={navigate} />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Docs Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 space-y-1">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              API Documentation
            </div>
            {sections.map((sec) => {
              const Icon = sec.icon;
              const active = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-sm font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400 dark:text-emerald-600' : 'text-zinc-400'}`} />
                  <span>{sec.label}</span>
                </button>
              );
            })}

            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 mt-6">
              <button
                onClick={() => navigate('/dashboard/api-keys')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/15 transition-colors"
              >
                <span>Get your API Key</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 max-w-3xl space-y-10 pb-16">
          {activeSection === 'intro' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white mb-2">
                  DataFlow API Overview
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  The DataFlow API platform provides direct, low-latency programmatic access to continuously updated, structured public and licensed datasets. Our automated ingestion engine continuously extracts records from upstream legal portals, normalizes data into standardized JSON, validates integrity, and partitions storage for immediate API querying.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-xs space-y-2 font-mono">
                <div className="text-zinc-400 text-[11px] uppercase">Base Production URL</div>
                <div className="flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  <span>https://api.dataflow.dev/api/v1</span>
                  <button
                    onClick={() => copyText('https://api.dataflow.dev/api/v1')}
                    className="p-1 text-zinc-400 hover:text-zinc-200"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Key Guarantees</h3>
                <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                    <span><strong>100% Legal & Attributed:</strong> Provenance tracked back to public domain licenses (OGDL 2.0, CC0 1.0, ODbL).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                    <span><strong>Deterministic Schemas:</strong> JSON responses conform to strict schema types with ISO 8601 timestamps.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                    <span><strong>Continuous Ingestion:</strong> Sync intervals between 5 minutes and 24 hours.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'auth' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                Authentication
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                All requests to the DataFlow API must be authenticated using an API key passed in either the <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-emerald-600 dark:text-emerald-400">Authorization: Bearer &lt;KEY&gt;</code> or <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-emerald-600 dark:text-emerald-400">x-api-key: &lt;KEY&gt;</code> header.
              </p>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-zinc-100 p-4 font-mono text-xs space-y-2">
                <div className="text-zinc-400"># Header Example</div>
                <div className="text-emerald-400">Authorization: Bearer df_live_79a24c8...</div>
              </div>

              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-zinc-800 dark:text-zinc-200 space-y-1">
                <div className="font-bold text-amber-500">Security Warning</div>
                <p>
                  API keys carry full query access and deduct from your monthly quota. Never commit your secret keys to public client-side JavaScript repositories or GitHub. Store them securely in backend server environment variables.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'endpoints' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                Endpoints Reference
              </h1>

              <div className="space-y-6">
                <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-bold">GET</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">/api/v1/opportunities</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Query active public procurement solicitations, government tenders, and institutional contracts.
                  </p>
                  <div className="text-xs font-mono space-y-1 text-zinc-500">
                    <div>Parameters: <code>category</code>, <code>location</code>, <code>status</code>, <code>min_value</code>, <code>max_value</code>, <code>sort_by</code>, <code>order</code>, <code>page</code>, <code>limit</code></div>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-bold">GET</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">/api/v1/opportunities/:id</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Fetch a single opportunity record by its unique system ID or external procurement identifier.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-bold">GET</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">/api/datasets</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    List all available datasets in the catalog with record counts, sync cadences, and schema summaries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'pagination' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                Pagination, Filtering & Sorting
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Collection endpoints accept query parameters for predictable offset pagination and field filtering.
              </p>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 font-mono text-zinc-500">
                    <tr>
                      <th className="px-4 py-2.5">Parameter</th>
                      <th className="px-4 py-2.5">Default</th>
                      <th className="px-4 py-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-300">
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-emerald-600">page</td>
                      <td className="px-4 py-2.5 font-mono">1</td>
                      <td className="px-4 py-2.5">Page number (1-indexed)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-emerald-600">limit</td>
                      <td className="px-4 py-2.5 font-mono">20</td>
                      <td className="px-4 py-2.5">Max records per page (max 100)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-emerald-600">sort_by</td>
                      <td className="px-4 py-2.5 font-mono">created_at</td>
                      <td className="px-4 py-2.5">Sort column (created_at, value, deadline)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-emerald-600">order</td>
                      <td className="px-4 py-2.5 font-mono">desc</td>
                      <td className="px-4 py-2.5">Order direction ('asc' or 'desc')</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'rate-limits' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                Rate Limits & Quota Metering
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Requests are metered across two independent constraints: monthly volume quota and per-second burst throughput.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <h4 className="text-xs font-bold uppercase font-mono text-zinc-400 mb-1">Burst Rate Limit</h4>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Up to 200 req/sec</p>
                  <p className="text-xs text-zinc-500 mt-1">If exceeded, returns HTTP 429 Too Many Requests with <code className="font-mono text-emerald-500">Retry-After: 1</code> header.</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <h4 className="text-xs font-bold uppercase font-mono text-zinc-400 mb-1">Monthly Quota</h4>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">1k - 500k req/month</p>
                  <p className="text-xs text-zinc-500 mt-1">Metered accurately in persistent SQLite database. Upgrades apply immediately.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'errors' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                Error Handling
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The API returns standard HTTP status codes and structured JSON errors.
              </p>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 p-4 font-mono text-xs text-zinc-100">
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
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                Live Interactive API Tester
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Execute live requests against the local data repository in real time.
              </p>
              <ApiConsole initialEndpoint="/api/v1/opportunities" />
            </div>
          )}

          {activeSection === 'examples' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                SDK & Code Examples
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Sample code for querying public procurement datasets.
              </p>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 p-5 font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed">
                <div className="text-emerald-400 mb-2"># Python 3 example</div>
                <pre>{`import requests

API_KEY = "df_live_your_key"
url = "https://api.dataflow.dev/api/v1/opportunities"

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
