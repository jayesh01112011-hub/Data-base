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
  CheckCircle2,
  Terminal,
  Eye,
  EyeOff
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
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

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

  const copyRowCurl = (prefix: string) => {
    const cmd = `curl -X GET "https://api.labway.dev/api/v1/opportunities" \\\n  -H "Authorization: Bearer ${prefix}••••••••••••••••"`;
    navigator.clipboard.writeText(cmd);
    showToast('cURL template copied to clipboard');
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F4F5F2] font-display">
            API Key Credentials
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Provision and audit bearer tokens used by your pipelines to query the LabWay ingestion gateway.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-[#5B82FF] hover:bg-[#6F92FF] text-white shadow-sm transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Create New Secret Key
        </button>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0D0F12] flex items-start gap-3 text-xs text-zinc-300">
        <AlertTriangle className="w-4 h-4 text-[#5B82FF] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-[#F4F5F2]">Security Standards: </span>
          Keep secret keys in environment variables (`process.env.LABWAY_API_KEY`). Never expose bearer tokens in client-side bundles or public repositories.
        </div>
      </div>

      {/* Keys Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0D0F12] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#5B82FF]" />
            <h3 className="text-sm font-semibold text-[#F4F5F2] font-display">Provisioned Keys</h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">{keys.length} Keys Configured</span>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-zinc-400">
            <RefreshCw className="w-5 h-5 animate-spin text-[#5B82FF]" />
            <span className="text-xs font-mono">Loading keys...</span>
          </div>
        ) : keys.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs font-mono">
            No API keys found. Create your first key to begin querying data.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070809] border-b border-white/[0.08] font-mono text-zinc-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Key Identifier</th>
                  <th className="px-6 py-3 font-semibold">Token Prefix</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Scopes</th>
                  <th className="px-6 py-3 font-semibold">Created</th>
                  <th className="px-6 py-3 font-semibold">Expires</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-zinc-300 font-sans">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5 font-medium text-[#F4F5F2]">
                      {k.name}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[#5B82FF]">
                      <div className="flex items-center gap-2">
                        <span>
                          {revealedKeys[k.id] ? `${k.key_prefix}live_auth_token` : `${k.key_prefix}••••••••••••`}
                        </span>
                        <button
                          onClick={() => toggleReveal(k.id)}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors"
                          title={revealedKeys[k.id] ? 'Mask key' : 'Show prefix'}
                        >
                          {revealedKeys[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      {k.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#5B82FF]/10 text-[#5B82FF] border border-[#5B82FF]/20">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> Revoked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
                          read:datasets
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-400 border border-white/[0.08]">
                          100 r/m
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-zinc-500">
                      {new Date(k.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-zinc-500">
                      {k.expires_at ? new Date(k.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => copyRowCurl(k.key_prefix)}
                        className="p-1 text-zinc-400 hover:text-[#5B82FF] transition-colors"
                        title="Copy cURL snippet"
                      >
                        <Terminal className="w-3.5 h-3.5 inline" />
                      </button>
                      {k.is_active ? (
                        <button
                          onClick={() => handleRevoke(k.id)}
                          className="px-2.5 py-1 rounded text-[11px] font-medium text-amber-400 hover:bg-amber-400/10 transition-colors"
                        >
                          Revoke
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleDelete(k.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Delete key record"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#0D0F12] border border-white/[0.1] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#F4F5F2] font-display">Create New API Key</h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Key Identifier / Purpose
                </label>
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Production Ingestion Worker"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-white/[0.1] bg-[#12151A] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#5B82FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Expiration
                </label>
                <select
                  value={expiresInDays || ''}
                  onChange={(e) => setExpiresInDays(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-white/[0.1] bg-[#12151A] text-zinc-100 focus:outline-none focus:border-[#5B82FF]"
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
                  className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-[#5B82FF] hover:bg-[#6F92FF] text-white shadow-sm disabled:opacity-50 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-[#0D0F12] border border-[#5B82FF]/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-[#5B82FF]">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-base font-semibold text-[#F4F5F2] font-display">Store Secret Key Securely</h3>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <strong>IMPORTANT:</strong> For security reasons, this secret key will <strong>NEVER</strong> be displayed again. Make sure to store it in your secrets manager.
            </div>

            <div className="p-3 rounded-xl bg-[#070809] border border-white/[0.1] flex items-center justify-between gap-3">
              <code className="font-mono text-xs text-[#5B82FF] select-all break-all">
                {newSecretKey}
              </code>
              <button
                onClick={copySecret}
                className="p-2 shrink-0 rounded-lg bg-[#5B82FF] hover:bg-[#6F92FF] text-white transition-colors"
                title="Copy to clipboard"
              >
                {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setNewSecretKey(null)}
                className="px-5 py-2 rounded-xl text-xs font-medium bg-white/[0.1] hover:bg-white/[0.15] text-[#F4F5F2] transition-colors"
              >
                I have securely saved my key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

