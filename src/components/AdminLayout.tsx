import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Database,
  PlayCircle,
  TrendingUp,
  Server,
  ArrowLeft,
  Sun,
  Moon,
  Menu,
  X,
  Activity,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface AdminLayoutProps {
  currentPath: string;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentPath,
  navigate,
  children
}) => {
  const { user } = useAuth();
  const { isDark, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminNav = [
    { label: 'Admin Overview', path: '/admin', icon: ShieldAlert },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Datasets Registry', path: '/admin/datasets', icon: Database },
    { label: 'Ingestion Pipeline', path: '/admin/ingestion', icon: PlayCircle },
    { label: 'Revenue & Subscriptions', path: '/admin/revenue', icon: TrendingUp },
    { label: 'System & Audit Logs', path: '/admin/system', icon: Server },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-white">DataFlow Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col justify-between transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-white">
                  DataFlow Core
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">Infrastructure Control</p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Operations
          </div>
          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.path;
            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-zinc-800">
            <button
              onClick={() => {
                navigate('/dashboard');
                setMobileOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App Dashboard</span>
            </button>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Operator:</span>
            <span className="font-mono text-zinc-200">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Role:</span>
            <span className="font-mono text-amber-400 font-semibold uppercase">{user?.role}</span>
          </div>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/60 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-500">ADMIN CONTROL CENTER</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs text-emerald-400 font-mono">ALL SERVICES HEALTHY</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              User View
            </button>
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
