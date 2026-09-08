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
    <div className="min-h-screen bg-[#070809] text-[#F4F5F2] flex flex-col transition-colors">
      <Navbar currentPath="/pricing" navigate={navigate} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 font-sans">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#5B82FF]/10 border border-[#5B82FF]/20 text-[#5B82FF] font-mono">
            <span>PREDICTABLE BILLING • ZERO SURPRISES</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#F4F5F2] font-display">
            Transparent Infrastructure Pricing
          </h1>
          <p className="text-base text-zinc-400">
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
                className={`p-6 rounded-2xl border flex flex-col justify-between transition-all font-sans ${
                  isGrowth
                    ? 'border-[#5B82FF] bg-[#0D0F12] shadow-2xl relative ring-1 ring-[#5B82FF]'
                    : 'border-white/[0.08] bg-[#0D0F12]'
                }`}
              >
                {isGrowth && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-[#5B82FF] text-white shadow-md">
                    Recommended
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wider text-[#F4F5F2] font-display">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400 min-h-[36px]">
                    {p.description}
                  </p>

                  <div className="my-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-bold text-[#F4F5F2] font-mono">
                        ₹{p.price_inr.toLocaleString()}
                      </span>
                      <span className="text-xs text-zinc-500">/month</span>
                    </div>
                    <p className="text-xs font-mono text-[#5B82FF] mt-1 font-semibold">
                      {p.monthly_quota.toLocaleString()} requests/mo
                    </p>
                    <p className="text-[11px] font-mono text-zinc-500">
                      Rate limit: {p.rate_limit_rps} req/sec
                    </p>
                  </div>

                  <ul className="space-y-3 text-xs text-zinc-300 mb-8 border-t border-white/[0.08] pt-5">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#5B82FF] shrink-0 mt-0.5" />
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
                      ? 'bg-[#5B82FF] hover:bg-[#6F92FF] text-white shadow-sm'
                      : 'bg-white/[0.08] hover:bg-white/[0.12] text-[#F4F5F2] border border-white/[0.1]'
                  }`}
                >
                  {user ? (user.plan_id === p.id ? 'Current Plan' : 'Select Plan') : p.price_inr === 0 ? 'Get Started' : `Upgrade to ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0D0F12] p-6 md:p-8 mb-20 font-sans">
          <h2 className="text-xl font-bold text-[#F4F5F2] font-display mb-6">Complete Specification Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] text-zinc-500 font-mono">
                <tr>
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-4">Free</th>
                  <th className="py-3 px-4">Developer</th>
                  <th className="py-3 px-4">Growth</th>
                  <th className="py-3 px-4">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#F4F5F2]">Monthly Quota</td>
                  <td className="py-3 px-4 font-mono text-zinc-300">1,000</td>
                  <td className="py-3 px-4 font-mono text-zinc-300">25,000</td>
                  <td className="py-3 px-4 font-mono text-zinc-300">100,000</td>
                  <td className="py-3 px-4 font-mono text-zinc-300">500,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#F4F5F2]">Max Rate Limit</td>
                  <td className="py-3 px-4 font-mono text-zinc-300">5 req/s</td>
                  <td className="py-3 px-4 font-mono text-zinc-300">20 req/s</td>
                  <td className="py-3 px-4 font-mono text-zinc-300">60 req/s</td>
                  <td className="py-3 px-4 font-mono text-zinc-300">200 req/s</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#F4F5F2]">Data Ingestion Sync</td>
                  <td className="py-3 px-4 text-zinc-400">Weekly</td>
                  <td className="py-3 px-4 text-zinc-400">Daily</td>
                  <td className="py-3 px-4 text-zinc-400">Hourly</td>
                  <td className="py-3 px-4 text-zinc-400">Continuous Real-time</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#F4F5F2]">Telemetry & Export</td>
                  <td className="py-3 px-4 text-zinc-600">—</td>
                  <td className="py-3 px-4 text-zinc-600">—</td>
                  <td className="py-3 px-4 text-[#5B82FF] font-bold">Included</td>
                  <td className="py-3 px-4 text-[#5B82FF] font-bold">Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#F4F5F2]">Support SLA</td>
                  <td className="py-3 px-4 text-zinc-400">Community</td>
                  <td className="py-3 px-4 text-zinc-400">Email (24h)</td>
                  <td className="py-3 px-4 text-zinc-400">Priority Email & Slack</td>
                  <td className="py-3 px-4 text-zinc-400">Dedicated Technical Lead</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#F4F5F2]">Availability Guarantee</td>
                  <td className="py-3 px-4 text-zinc-600">Standard</td>
                  <td className="py-3 px-4 text-zinc-400">99.5%</td>
                  <td className="py-3 px-4 text-zinc-400">99.9%</td>
                  <td className="py-3 px-4 text-[#5B82FF] font-semibold">99.99% Multi-region</td>
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

