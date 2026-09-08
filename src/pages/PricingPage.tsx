import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, Zap, ShieldCheck, HelpCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { api } from '../services/apiClient';
import { Plan } from '../types';
import { useAuth } from '../context/AuthContext';

interface PricingPageProps {
  navigate: (path: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.billing.getPlans()
      .then((res) => {
        if (res.plans) setPlans(res.plans);
      })
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Navbar currentPath="/pricing" navigate={navigate} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <span>PREDICTABLE BILLING • ZERO SURPRISES</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Simple, Transparent Developer Pricing
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Start free, build prototypes, and scale your data pipelines seamlessly. Switch or cancel plans anytime with pro-rated quotas.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {plans.map((p) => {
            const isGrowth = p.id === 'growth';
            return (
              <div
                key={p.id}
                className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                  isGrowth
                    ? 'border-emerald-500 bg-white dark:bg-zinc-900 shadow-xl ring-2 ring-emerald-500 relative'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60'
                }`}
              >
                {isGrowth && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-600 text-white shadow-md">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-50">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 min-h-[36px]">
                    {p.description}
                  </p>

                  <div className="my-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white">
                        ₹{p.price_inr.toLocaleString()}
                      </span>
                      <span className="text-xs text-zinc-500">/month</span>
                    </div>
                    <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                      {p.monthly_quota.toLocaleString()} requests/mo
                    </p>
                    <p className="text-[11px] font-mono text-zinc-500">
                      Rate limit: {p.rate_limit_rps} req/sec
                    </p>
                  </div>

                  <ul className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 mb-8 border-t border-zinc-100 dark:border-zinc-800 pt-5">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    if (user) {
                      navigate('/dashboard/billing');
                    } else {
                      navigate('/register');
                    }
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isGrowth
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {user ? (user.plan_id === p.id ? 'Current Plan' : 'Select Plan') : p.price_inr === 0 ? 'Get Started' : `Upgrade to ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 md:p-8 mb-20">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white mb-6">Full Tier Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono">
                <tr>
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-4">Free</th>
                  <th className="py-3 px-4">Developer</th>
                  <th className="py-3 px-4">Growth</th>
                  <th className="py-3 px-4">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                <tr>
                  <td className="py-3 px-4 font-semibold">Monthly Quota</td>
                  <td className="py-3 px-4 font-mono">1,000</td>
                  <td className="py-3 px-4 font-mono">25,000</td>
                  <td className="py-3 px-4 font-mono">100,000</td>
                  <td className="py-3 px-4 font-mono">500,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Max Rate Limit</td>
                  <td className="py-3 px-4 font-mono">5 req/s</td>
                  <td className="py-3 px-4 font-mono">20 req/s</td>
                  <td className="py-3 px-4 font-mono">60 req/s</td>
                  <td className="py-3 px-4 font-mono">200 req/s</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Data Refresh Rate</td>
                  <td className="py-3 px-4">Weekly</td>
                  <td className="py-3 px-4">Daily</td>
                  <td className="py-3 px-4">Hourly</td>
                  <td className="py-3 px-4">Continuous Real-time</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Telemetry & CSV Export</td>
                  <td className="py-3 px-4 text-zinc-400">—</td>
                  <td className="py-3 px-4 text-zinc-400">—</td>
                  <td className="py-3 px-4 text-emerald-500 font-bold">Included</td>
                  <td className="py-3 px-4 text-emerald-500 font-bold">Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Support Tier</td>
                  <td className="py-3 px-4">Community</td>
                  <td className="py-3 px-4">Email (24h)</td>
                  <td className="py-3 px-4">Priority Email & Slack</td>
                  <td className="py-3 px-4">Dedicated Account Rep</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">SLA Guarantee</td>
                  <td className="py-3 px-4 text-zinc-400">Best Effort</td>
                  <td className="py-3 px-4">99.5%</td>
                  <td className="py-3 px-4">99.9%</td>
                  <td className="py-3 px-4">99.99% Multi-region</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer navigate={navigate} />
    </div>
  );
};
