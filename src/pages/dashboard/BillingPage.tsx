import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Zap,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { Plan, Subscription, Invoice, UsageSummary } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const BillingPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const [plansRes, subRes, sumRes] = await Promise.all([
        api.billing.getPlans().catch(() => null),
        api.billing.getSubscription().catch(() => null),
        api.usage.getSummary().catch(() => null)
      ]);

      if (plansRes?.plans) setPlans(plansRes.plans);
      if (subRes?.subscription) setSubscription(subRes.subscription);
      if (subRes?.invoices) setInvoices(subRes.invoices);
      if (sumRes?.summary) setSummary(sumRes.summary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handlePlanChange = async (planId: string) => {
    if (subscription?.plan_id === planId) return;

    setChangingPlan(planId);
    try {
      await api.billing.changePlan(planId);
      showToast(`Successfully switched plan to ${planId.toUpperCase()}`, 'success');
      await refreshUser();
      await fetchBilling();
    } catch (err: any) {
      showToast(err.message || 'Failed to update subscription', 'error');
    } finally {
      setChangingPlan(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your active plan? Your rate limits and quotas will revert to the Free tier at period end.')) return;

    try {
      await api.billing.cancelSubscription();
      showToast('Subscription scheduled for cancellation at period end', 'info');
      fetchBilling();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel subscription', 'error');
    }
  };

  const handleDownloadInvoice = (inv: Invoice) => {
    showToast(`Downloading receipt ${inv.invoice_number} (₹${inv.amount_inr.toLocaleString()})`, 'success');
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-400">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        <span className="text-xs">Loading billing details...</span>
      </div>
    );
  }

  const currentPlan = plans.find(p => p.id === (subscription?.plan_id || user?.plan_id)) || plans[0];
  const quotaUsedPct = summary
    ? Math.min(100, Math.round((summary.monthRequests / (summary.monthlyQuota || 1)) * 100))
    : 0;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Billing & Subscription
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your workspace plan, view usage metering limits, and download payment receipts.
        </p>
      </div>

      {/* Active Subscription Overview Card */}
      <div className="p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                ACTIVE PLAN
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                Status: {subscription?.status || 'Active'}
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white">
              {currentPlan?.name} Tier
            </h2>
            <p className="text-xs text-zinc-500 mt-1">{currentPlan?.description}</p>
          </div>

          <div className="text-left md:text-right">
            <div className="text-3xl font-extrabold text-zinc-950 dark:text-white">
              ₹{currentPlan?.price_inr.toLocaleString()}
              <span className="text-xs text-zinc-500 font-normal"> / month</span>
            </div>
            <p className="text-xs font-mono text-zinc-500 mt-1">
              Next billing: {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'Continuous'}
            </p>
          </div>
        </div>

        {/* Quota Progress Gauge */}
        <div className="pt-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Monthly Request Quota Usage
            </span>
            <span className="font-mono text-zinc-500">
              {summary?.monthRequests.toLocaleString()} / {summary?.monthlyQuota.toLocaleString()} requests ({quotaUsedPct}%)
            </span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                quotaUsedPct > 85 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${quotaUsedPct}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            Rate limit: {currentPlan?.rate_limit_rps} requests/second burst allowance.
          </p>
        </div>

        {subscription?.plan_id !== 'free' && (
          <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button
              onClick={handleCancel}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </div>

      {/* Plan Upgrade / Downgrade Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-zinc-950 dark:text-white">Available Plans</h2>
          <p className="text-xs text-zinc-500">Upgrade or switch tiers anytime with immediate quota adjustment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => {
            const isCurrent = (subscription?.plan_id || user?.plan_id) === p.id;
            return (
              <div
                key={p.id}
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">{p.name}</h3>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 font-bold">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-extrabold text-zinc-950 dark:text-white mb-2">
                    ₹{p.price_inr.toLocaleString()}
                    <span className="text-xs text-zinc-500 font-normal">/mo</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mb-4">{p.description}</p>
                  <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 mb-6">
                    {p.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-[11px]">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handlePlanChange(p.id)}
                  disabled={isCurrent || changingPlan === p.id}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                  }`}
                >
                  {changingPlan === p.id ? 'Updating...' : isCurrent ? 'Active Plan' : `Switch to ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Invoice History</h3>
          <span className="text-xs font-mono text-zinc-500">{invoices.length} Invoices</span>
        </div>

        {invoices.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            No invoices on record for this workspace.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 font-mono text-zinc-500">
                <tr>
                  <th className="px-6 py-3">Invoice Number</th>
                  <th className="px-6 py-3">Billing Cycle</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-zinc-700 dark:text-zinc-300">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-6 py-3.5 font-bold text-zinc-900 dark:text-zinc-100">
                      {inv.invoice_number}
                    </td>
                    <td className="px-6 py-3.5 text-zinc-500">
                      {inv.billing_period}
                    </td>
                    <td className="px-6 py-3.5 font-bold">
                      ₹{inv.amount_inr.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(inv)}
                        className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
