import React, { useState } from 'react';
import {
  User,
  Lock,
  Bell,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/apiClient';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [company, setCompany] = useState('LabWay Systems');
  const [profileSaved, setProfileSaved] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notifications
  const [alert80, setAlert80] = useState(true);
  const [alert100, setAlert100] = useState(true);
  const [monthlySummary, setMonthlySummary] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    showToast('Workspace profile saved successfully', 'success');
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      showToast('Master password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F4F5F2] font-display">
          Workspace Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1 font-sans">
          Manage developer credentials, alert triggers, interface configuration, and infrastructure backups.
        </p>
      </div>

      {/* 1. Profile Info */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0D0F12] space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#5B82FF]" />
          <h2 className="text-sm font-semibold text-[#F4F5F2] font-display">Profile Details</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/[0.1] bg-[#070809] text-[#F4F5F2] focus:outline-none focus:border-[#5B82FF]"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 rounded-lg border border-white/[0.05] bg-[#12151A] text-zinc-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Organization / Team</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/[0.1] bg-[#070809] text-[#F4F5F2] focus:outline-none focus:border-[#5B82FF]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg font-medium bg-[#5B82FF] hover:bg-[#6F92FF] text-white transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* 2. Security / Change Password */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0D0F12] space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#5B82FF]" />
          <h2 className="text-sm font-semibold text-[#F4F5F2] font-display">Security & Password</h2>
        </div>

        {passwordError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block font-medium text-zinc-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border border-white/[0.1] bg-[#070809] text-[#F4F5F2] focus:outline-none focus:border-[#5B82FF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full px-3 py-2 rounded-lg border border-white/[0.1] bg-[#070809] text-[#F4F5F2] focus:outline-none focus:border-[#5B82FF]"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3 py-2 rounded-lg border border-white/[0.1] bg-[#070809] text-[#F4F5F2] focus:outline-none focus:border-[#5B82FF]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-4 py-2 rounded-lg font-medium bg-[#12151A] border border-white/[0.1] text-white hover:bg-white/[0.1] transition-colors disabled:opacity-50"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Notification Thresholds */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0D0F12] space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#5B82FF]" />
          <h2 className="text-sm font-semibold text-[#F4F5F2] font-display">Alert Preferences</h2>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-[#070809] cursor-pointer hover:border-white/[0.15]">
            <div>
              <span className="font-medium block text-zinc-200">80% Quota Threshold Warning</span>
              <span className="text-zinc-500">Receive webhook notification when workspace consumption reaches 80%.</span>
            </div>
            <input
              type="checkbox"
              checked={alert80}
              onChange={(e) => setAlert80(e.target.checked)}
              className="w-4 h-4 text-[#5B82FF] rounded bg-[#12151A] border-white/[0.2] focus:ring-[#5B82FF]"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-[#070809] cursor-pointer hover:border-white/[0.15]">
            <div>
              <span className="font-medium block text-zinc-200">100% Rate Limit Exhaustion Alert</span>
              <span className="text-zinc-500">Real-time alert when ingress encounters 429 quota exhaustion.</span>
            </div>
            <input
              type="checkbox"
              checked={alert100}
              onChange={(e) => setAlert100(e.target.checked)}
              className="w-4 h-4 text-[#5B82FF] rounded bg-[#12151A] border-white/[0.2] focus:ring-[#5B82FF]"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-[#070809] cursor-pointer hover:border-white/[0.15]">
            <div>
              <span className="font-medium block text-zinc-200">Monthly Performance Digest</span>
              <span className="text-zinc-500">Aggregated breakdown of latency percentiles, total requests, and error rate.</span>
            </div>
            <input
              type="checkbox"
              checked={monthlySummary}
              onChange={(e) => setMonthlySummary(e.target.checked)}
              className="w-4 h-4 text-[#5B82FF] rounded bg-[#12151A] border-white/[0.2] focus:ring-[#5B82FF]"
            />
          </label>
        </div>
      </div>

      {/* 4. Appearance / Theme */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0D0F12] space-y-4">
        <h2 className="text-sm font-semibold text-[#F4F5F2] font-display">Interface Appearance</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Laptop },
          ].map((t) => {
            const Icon = t.icon;
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id as any)}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-medium transition-all ${
                  active
                    ? 'border-[#5B82FF] bg-[#5B82FF]/10 text-[#5B82FF]'
                    : 'border-white/[0.08] text-zinc-400 hover:border-white/[0.2]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Complete Project Export */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0D0F12] space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#F4F5F2] font-display">Complete Project Export</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Download the complete LabWay project source code, database tables, and configurations as-is.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href="/dataflow-api-complete.zip"
            download="labway-api-complete.zip"
            className="p-4 rounded-xl border border-[#5B82FF]/30 bg-[#5B82FF]/5 hover:bg-[#5B82FF]/10 flex flex-col justify-between gap-2 transition-colors group"
          >
            <div>
              <span className="text-xs font-semibold text-[#5B82FF] block">
                Download Complete Project (.ZIP)
              </span>
              <span className="text-[11px] text-zinc-400 leading-snug block mt-0.5 font-sans">
                Every backend, frontend, database, Docker, and config file packaged for immediate local extraction.
              </span>
            </div>
            <span className="text-xs font-mono font-medium text-[#5B82FF] group-hover:underline">
              Download ZIP (327 KB) →
            </span>
          </a>

          <a
            href="/COMPLETE_SOURCE_CODE.txt"
            download="COMPLETE_SOURCE_CODE.txt"
            className="p-4 rounded-xl border border-white/[0.08] bg-[#070809] hover:bg-white/[0.03] flex flex-col justify-between gap-2 transition-colors group"
          >
            <div>
              <span className="text-xs font-semibold text-zinc-200 block">
                Download Raw Source Code (.TXT)
              </span>
              <span className="text-[11px] text-zinc-400 leading-snug block mt-0.5 font-sans">
                Single text file formatted with standard file markers for simple script unpacking.
              </span>
            </div>
            <span className="text-xs font-mono font-medium text-zinc-400 group-hover:underline">
              Download TXT (378 KB) →
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

