import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Database,
  PlayCircle,
  TrendingUp,
  Server,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LabWayLogo } from './LabWayLogo';

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
    <div className="min-h-screen bg-[#070809] text-[#F4F5F2] flex flex-col md:flex-row font-sans selection:bg-[#5B82FF]/30 selection:text-white">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/[0.08] bg-[#0D0F12] sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <LabWayLogo size="sm" />
          <span className="font-display font-semibold text-sm text-white">LabWay Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-zinc-400 hover:bg-white/[0.05]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 shrink-0 border-r border-white/[0.08] bg-[#0D0F12] flex flex-col justify-between transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <LabWayLogo size="md" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-sm tracking-tight text-white">
                  LabWay
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#5B82FF]/20 text-[#5B82FF] border border-[#5B82FF]/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono">Infrastructure Control</p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
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
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-[#12151A] text-white border border-white/[0.1] font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#5B82FF]' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/[0.08]">
            <button
              onClick={() => {
                navigate('/dashboard');
                setMobileOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App Dashboard</span>
            </button>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="p-4 border-t border-white/[0.08] bg-[#070809] space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Operator:</span>
            <span className="text-zinc-200 truncate max-w-[120px]">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Role:</span>
            <span className="text-[#5B82FF] font-semibold uppercase">{user?.role}</span>
          </div>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#070809]">
        <header className="h-16 border-b border-white/[0.08] bg-[#0D0F12]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-500">ADMIN CONTROL CENTER</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#5B82FF] animate-pulse"></span>
            <span className="text-xs text-[#5B82FF] font-mono">ALL SERVICES HEALTHY</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1.5 rounded-lg border border-white/[0.1] bg-[#12151A] text-xs font-medium text-zinc-300 hover:text-white hover:border-white/[0.2] transition-colors"
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

