import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
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
          <h1 className="text-2xl font-bold tracking-tight text-white">
            User Directory
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Search developer accounts, inspect API key allotments, and manage operational access.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 focus:outline-none focus:border-amber-500 w-64"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
          >
            Search
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Registered Developer Accounts</h3>
          <span className="text-xs font-mono text-zinc-500">{users.length} Records</span>
        </div>

        {loading ? (
          <div className="py-20 flex items-center justify-center gap-2 text-zinc-500">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
            <span className="text-xs">Loading user directory...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 border-b border-zinc-800 font-mono text-zinc-400">
                <tr>
                  <th className="px-6 py-3">User & Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Keys</th>
                  <th className="px-6 py-3">30d Requests</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-800/40">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[11px] font-mono text-zinc-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                        u.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono uppercase text-emerald-400 font-semibold">
                      {u.plan_name || u.plan_id}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-zinc-400">
                      {u.api_keys_count} keys
                    </td>
                    <td className="px-6 py-3.5 font-mono text-white font-bold">
                      {Number(u.total_api_requests || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleToggleRole(u)}
                        disabled={updatingId === u.id}
                        className="px-2 py-1 rounded text-[10px] font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={updatingId === u.id}
                        className={`px-2 py-1 rounded text-[10px] font-semibold ${
                          u.status === 'active' ? 'text-rose-400 hover:bg-rose-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'
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
