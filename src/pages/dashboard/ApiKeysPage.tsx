import React, { useState, useEffect } from 'react';
import {
  Key,
  Plus,
  Copy,
  Check,
  AlertTriangle,
  Trash2,
  XCircle,
  RefreshCw,
  ShieldCheck,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { APIKey } from '../../types';
import { useToast } from '../../context/ToastContext';

export const ApiKeysPage: React.FC = () => {
  const { showToast } = useToast();
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);
  const [creating, setCreating] = useState(false);

  // Created Secret Key Modal
  const [newSecretKey, setNewSecretKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await api.apiKeys.list();
      if (res.keys) setKeys(res.keys);
    } catch {
      setKeys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    setCreating(true);
    try {
      const res = await api.apiKeys.create(keyName.trim(), expiresInDays);
      setModalOpen(false);
      setKeyName('');
      setNewSecretKey(res.secretKey);
      fetchKeys();
      showToast('API key created. Save your secret key now!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create key', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Applications using it will be rejected immediately.')) return;
    try {
      await api.apiKeys.revoke(id);
      showToast('API key revoked successfully', 'info');
      fetchKeys();
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke key', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this key record permanently?')) return;
    try {
      await api.apiKeys.delete(id);
      showToast('API key deleted', 'info');
      fetchKeys();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete key', 'error');
    }
  };

  const copySecret = () => {
    if (!newSecretKey) return;
    navigator.clipboard.writeText(newSecretKey);
    setCopiedKey(true);
    showToast('Secret key copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            API Key Credentials
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Generate and manage secret tokens to authenticate automated requests to the DataFlow gateway.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors self-start"
        >
          <Plus className="w-4 h-4" />
          Create New Secret Key
        </button>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3 text-xs text-zinc-800 dark:text-zinc-200">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-500">Security Recommendation: </span>
          Do not embed your secret API keys in client-side code, mobile binaries, or public GitHub repositories. Use separate keys for staging and production environments, and rotate them regularly.
        </div>
      </div>

      {/* Keys Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Provisioned Keys</h3>
          <span className="text-xs font-mono text-zinc-500">{keys.length} Keys Configured</span>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-zinc-400">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
            <span className="text-xs">Loading keys...</span>
          </div>
        ) : keys.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs">
            No API keys found. Create your first key to begin querying data.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 font-mono text-zinc-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Key Name</th>
                  <th className="px-6 py-3 font-semibold">Prefix</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Created</th>
                  <th className="px-6 py-3 font-semibold">Last Used</th>
                  <th className="px-6 py-3 font-semibold">Expires</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-6 py-3.5 font-semibold text-zinc-900 dark:text-zinc-100">
                      {k.name}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-emerald-600 dark:text-emerald-400">
                      {k.key_prefix}••••••••
                    </td>
                    <td className="px-6 py-3.5">
                      {k.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> Revoked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-zinc-500">
                      {new Date(k.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-zinc-500">
                      {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-zinc-500">
                      {k.expires_at ? new Date(k.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      {k.is_active ? (
                        <button
                          onClick={() => handleRevoke(k.id)}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold text-amber-500 hover:bg-amber-500/10 transition-colors"
                        >
                          Revoke
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleDelete(k.id)}
                        className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                        title="Delete key record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Create Key */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Create New API Key</h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Key Identifier / Purpose
                </label>
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Production Ingestion Worker"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Expiration
                </label>
                <select
                  value={expiresInDays || ''}
                  onChange={(e) => setExpiresInDays(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Never Expires</option>
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                  <option value="365">1 Year</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm disabled:opacity-50"
                >
                  {creating ? 'Generating...' : 'Generate Secret Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: One-Time Secret Key Warning */}
      {newSecretKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-emerald-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Copy Your Secret Key Now</h3>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs">
              <strong>CRITICAL:</strong> This secret key will <strong>NEVER</strong> be shown to you again. If you lose it, you will need to generate a new key.
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
              <code className="font-mono text-xs text-emerald-400 select-all break-all">
                {newSecretKey}
              </code>
              <button
                onClick={copySecret}
                className="p-2 shrink-0 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                title="Copy to clipboard"
              >
                {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setNewSecretKey(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800"
              >
                I have saved my secret key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
