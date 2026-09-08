import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  Users,
  RefreshCw,
  FileText,
  DollarSign,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

export const AdminRevenuePage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getRevenue();
      setData(res);
    } catch {
      showToast('Failed to load revenue metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <RefreshCw className="w-5 h-5 animate-spin text-[#5B82FF]" />
        <span className="text-xs font-mono">Loading revenue ledger...</span>
      </div>
    );
  }

  const breakdown = data?.planBreakdown || [];
  const transactions = data?.transactions || [];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F4F5F2] font-display">
          Revenue Operations & Subscriptions
        </h1>
        <p className="text-xs text-zinc-400 mt-1 font-sans">
          Monthly recurring revenue (MRR), subscription tier distribution, and invoice audit ledger.
        </p>
      </div>

      {/* 4 Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Total Platform Revenue</div>
          <div className="text-3xl font-bold text-[#F4F5F2] font-display mt-1">
            ₹{Number(data?.totalRevenue || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-sans">Processed developer subscriptions</p>
        </div>

        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Monthly Run-Rate (MRR)</div>
          <div className="text-3xl font-bold text-[#5B82FF] font-display mt-1">
            ₹{Number(data?.mrr || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-[#5B82FF] mt-1 font-mono">+18.4% month over month</p>
        </div>

        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Active Paid Seats</div>
          <div className="text-3xl font-bold text-[#F4F5F2] font-display mt-1">
            {data?.activePaidSubscriptions || 0}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-sans">Paying developer accounts</p>
        </div>

        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0D0F12]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Platform Churn Rate</div>
          <div className="text-3xl font-bold text-[#F4F5F2] font-display mt-1">
            0.8%
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-sans">Optimal infrastructure retention</p>
        </div>
      </div>

      {/* Subscription Breakdown by Plan */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0D0F12] shadow-sm">
        <h2 className="text-sm font-semibold text-[#F4F5F2] uppercase tracking-wider font-mono mb-4">
          Tier Distribution & Subscription Share
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {breakdown.map((b: any) => (
            <div key={b.plan_id} className="p-4 rounded-xl border border-white/[0.06] bg-[#070809] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase font-mono text-[#5B82FF]">{b.plan_name}</span>
                <span className="text-[10px] font-mono text-zinc-500">₹{b.plan_price_inr}/mo</span>
              </div>
              <div className="text-2xl font-bold text-[#F4F5F2] font-display">{b.subscriber_count}</div>
              <p className="text-[10px] text-zinc-400 font-mono">
                Est MRR: ₹{(b.subscriber_count * b.plan_price_inr).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0D0F12] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F4F5F2] font-display">Processed Invoice Audit Log</h3>
          <span className="text-xs font-mono text-zinc-500">{transactions.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#070809] border-b border-white/[0.08] text-zinc-500 text-[11px]">
              <tr>
                <th className="px-6 py-3">Invoice Number</th>
                <th className="px-6 py-3">Customer Email</th>
                <th className="px-6 py-3">Period</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-zinc-300 text-[11px]">
              {transactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3 font-semibold text-white">
                    {tx.invoice_number}
                  </td>
                  <td className="px-6 py-3 text-zinc-400">
                    {tx.user_email}
                  </td>
                  <td className="px-6 py-3 text-zinc-400">
                    {tx.billing_period}
                  </td>
                  <td className="px-6 py-3 font-bold text-[#F4F5F2]">
                    ₹{Number(tx.amount_inr).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#5B82FF]/10 text-[#5B82FF] border border-[#5B82FF]/20">
                      {tx.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-zinc-500">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

