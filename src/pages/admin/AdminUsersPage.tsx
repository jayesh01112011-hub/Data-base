import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  RefreshCw,
  Key,
  Activity
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

export const AdminUsersPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getUsers(search);
      if (res.users) setUsers(res.users);
    } catch {
      showToast('Failed to fetch user list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    setUpdatingId(user.id);
    try {
      await api.admin.updateUserStatus(user.id, { status: newStatus });
      showToast(`User status set to ${newStatus}`, 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleRole = async (user: any) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    setUpdatingId(user.id);
    try {
      await api.admin.updateUserStatus(user.id, { role: newRole });
      showToast(`User role changed to ${newRole}`, 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user role', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F4F5F2] font-display">
            Developer Directory
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Inspect developer accounts, key allotments, and grant role permissions.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 font-sans">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-white/[0.1] bg-[#0D0F12] text-[#F4F5F2] focus:outline-none focus:border-[#5B82FF] w-64"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-[#12151A] border border-white/[0.1] hover:bg-white/[0.08] text-zinc-200 text-xs font-medium transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#0D0F12] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F4F5F2] font-display">Registered Developer Accounts</h3>
          <span className="text-xs font-mono text-zinc-500">{users.length} Records</span>
        </div>

        {loading ? (
          <div className="py-20 flex items-center justify-center gap-2 text-zinc-500">
            <RefreshCw className="w-5 h-5 animate-spin text-[#5B82FF]" />
            <span className="text-xs font-mono">Loading developer directory...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070809] border-b border-white/[0.08] font-mono text-zinc-500">
                <tr>
                  <th className="px-6 py-3">User & Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Tier</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Keys</th>
                  <th className="px-6 py-3">30d Requests</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300 font-sans">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-[#F4F5F2]">{u.name}</div>
                      <div className="text-[11px] font-mono text-zinc-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono uppercase ${
                        u.role === 'admin' ? 'bg-[#5B82FF]/15 text-[#5B82FF] border border-[#5B82FF]/30' : 'bg-[#12151A] text-zinc-400 border border-white/[0.05]'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono uppercase text-[#5B82FF] font-semibold">
                      {u.plan_name || u.plan_id}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.status === 'active' ? 'text-[#5B82FF] bg-[#5B82FF]/10 border border-[#5B82FF]/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-zinc-400">
                      {u.api_keys_count} keys
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[#F4F5F2] font-semibold">
                      {Number(u.total_api_requests || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2 font-mono">
                      <button
                        onClick={() => handleToggleRole(u)}
                        disabled={updatingId === u.id}
                        className="px-2 py-1 rounded text-[10px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={updatingId === u.id}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                          u.status === 'active' ? 'text-rose-400 hover:bg-rose-500/10' : 'text-[#5B82FF] hover:bg-[#5B82FF]/10'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
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

