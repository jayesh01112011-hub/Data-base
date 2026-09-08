import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  ShieldCheck,
  RefreshCw,
  Clock
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
    if (!confirm('Are you sure you want to cancel your active plan? Rate limits and quotas will revert to Free tier at period end.')) return;

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
        <RefreshCw className="w-6 h-6 animate-spin text-[#5B82FF]" />
        <span className="text-xs font-mono">Loading billing details...</span>
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
        <h1 className="text-2xl font-bold tracking-tight text-[#F4F5F2] font-display">
          Subscription & Metering Quotas
        </h1>
        <p className="text-xs text-zinc-400 mt-1 font-sans">
          Manage your LabWay capacity limits, switch infrastructure tiers, and access invoice records.
        </p>
      </div>

      {/* Active Subscription Overview Card */}
      <div className="p-6 md:p-8 rounded-2xl border border-white/[0.08] bg-[#0D0F12] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#5B82FF]/15 text-[#5B82FF] font-semibold border border-[#5B82FF]/30">
                ACTIVE TIER
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                Status: {subscription?.status || 'Active'}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-[#F4F5F2] font-display">
              {currentPlan?.name} Tier
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-sans">{currentPlan?.description}</p>
          </div>

          <div className="text-left md:text-right">
            <div className="text-3xl font-bold text-[#F4F5F2] font-display">
              ₹{currentPlan?.price_inr.toLocaleString()}
              <span className="text-xs text-zinc-500 font-normal font-sans"> / month</span>
            </div>
            <p className="text-xs font-mono text-zinc-500 mt-1">
              Next renewal: {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'Continuous'}
            </p>
          </div>
        </div>

        {/* Quota Progress Gauge */}
        <div className="pt-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-zinc-300">
              Monthly Request Quota
            </span>
            <span className="font-mono text-zinc-400">
              {summary?.monthRequests.toLocaleString()} / {summary?.monthlyQuota.toLocaleString()} requests ({quotaUsedPct}%)
            </span>
          </div>
          <div className="w-full bg-[#12151A] h-2 rounded-full overflow-hidden border border-white/[0.05]">
            <div
              className="h-full rounded-full transition-all duration-500 bg-[#5B82FF]"
              style={{ width: `${quotaUsedPct}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            Throughput ceiling: {currentPlan?.rate_limit_rps} requests/second burst allowance.
          </p>
        </div>

        {subscription?.plan_id !== 'free' && (
          <div className="pt-6 mt-6 border-t border-white/[0.06] flex justify-end">
            <button
              onClick={handleCancel}
              className="text-xs font-medium text-rose-400 hover:underline transition-colors"
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </div>

      {/* Plan Upgrade / Downgrade Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[#F4F5F2] font-display">Available Tiers</h2>
          <p className="text-xs text-zinc-400">Scale burst allowances with immediate quota synchronization.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => {
            const isCurrent = (subscription?.plan_id || user?.plan_id) === p.id;
            return (
              <div
                key={p.id}
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-[#5B82FF] bg-[#5B82FF]/5 shadow-sm'
                    : 'border-white/[0.08] bg-[#0D0F12]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F4F5F2] font-display">{p.name}</h3>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#5B82FF]/20 text-[#5B82FF] font-semibold">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-[#F4F5F2] mb-2 font-display">
                    ₹{p.price_inr.toLocaleString()}
                    <span className="text-xs text-zinc-500 font-normal font-sans">/mo</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mb-4 font-sans">{p.description}</p>
                  <ul className="space-y-2 text-xs text-zinc-400 mb-6 font-sans">
                    {p.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#5B82FF] shrink-0 mt-0.5" />
                        <span className="text-[11px] text-zinc-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handlePlanChange(p.id)}
                  disabled={isCurrent || changingPlan === p.id}
                  className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-white/[0.05] text-zinc-500 cursor-default border border-white/[0.08]'
                      : 'bg-[#5B82FF] hover:bg-[#6F92FF] text-white shadow-xs'
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
      <div className="rounded-xl border border-white/[0.08] bg-[#0D0F12] overflow-hidden">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F4F5F2] font-display">Invoice History</h3>
          <span className="text-xs font-mono text-zinc-500">{invoices.length} Invoices</span>
        </div>

        {invoices.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs font-mono">
            No invoices on record for this workspace.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070809] border-b border-white/[0.08] font-mono text-zinc-500">
                <tr>
                  <th className="px-6 py-3">Invoice Number</th>
                  <th className="px-6 py-3">Billing Cycle</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] font-mono text-zinc-300">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5 font-semibold text-[#F4F5F2]">
                      {inv.invoice_number}
                    </td>
                    <td className="px-6 py-3.5 text-zinc-400">
                      {inv.billing_period}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-white">
                      ₹{inv.amount_inr.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#5B82FF]/10 text-[#5B82FF] border border-[#5B82FF]/20">
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(inv)}
                        className="inline-flex items-center gap-1 text-[#5B82FF] hover:underline"
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

