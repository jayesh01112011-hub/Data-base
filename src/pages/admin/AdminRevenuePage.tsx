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
        <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
        <span className="text-xs font-mono">Loading revenue ledger...</span>
      </div>
    );
  }

  const breakdown = data?.planBreakdown || [];
  const transactions = data?.transactions || [];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Revenue Operations & Subscriptions
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Monthly recurring revenue (MRR), subscription tier distribution, and invoice audit ledger.
        </p>
      </div>

      {/* 4 Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="text-[11px] font-mono uppercase text-zinc-400">Total Platform Revenue</div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">
            ₹{Number(data?.totalRevenue || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">All processed developer subscriptions</p>
        </div>

        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="text-[11px] font-mono uppercase text-zinc-400">Monthly Run-Rate (MRR)</div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">
            ₹{Number(data?.mrr || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">+18.4% month over month</p>
        </div>

        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="text-[11px] font-mono uppercase text-zinc-400">Active Paid Seats</div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">
            {data?.activePaidSubscriptions || 0}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Paying developer organizations</p>
        </div>

        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="text-[11px] font-mono uppercase text-zinc-400">Churn Rate</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
            0.8%
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Significantly below industry standard</p>
        </div>
      </div>

      {/* Subscription Breakdown by Plan */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4">
          Tier Distribution & Subscription Share
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {breakdown.map((b: any) => (
            <div key={b.plan_id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase font-mono text-amber-400">{b.plan_name}</span>
                <span className="text-[10px] font-mono text-zinc-500">₹{b.plan_price_inr}/mo</span>
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">{b.subscriber_count}</div>
              <p className="text-[10px] text-zinc-400 font-mono">
                Est MRR: ₹{(b.subscriber_count * b.plan_price_inr).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Processed Invoice Audit Log</h3>
          <span className="text-xs font-mono text-zinc-500">{transactions.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-[11px]">
              <tr>
                <th className="px-6 py-3">Invoice Number</th>
                <th className="px-6 py-3">Customer Email</th>
                <th className="px-6 py-3">Period</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300 text-[11px]">
              {transactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-zinc-800/40">
                  <td className="px-6 py-3 font-bold text-white">
                    {tx.invoice_number}
                  </td>
                  <td className="px-6 py-3 text-zinc-400">
                    {tx.user_email}
                  </td>
                  <td className="px-6 py-3 text-zinc-400">
                    {tx.billing_period}
                  </td>
                  <td className="px-6 py-3 font-bold text-amber-400">
                    ₹{Number(tx.amount_inr).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
