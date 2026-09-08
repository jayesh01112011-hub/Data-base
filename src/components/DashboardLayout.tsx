import React, { useState } from 'react';
import {
  LayoutDashboard,
  Key,
  BarChart3,
  Database,
  CreditCard,
  BookOpen,
  Settings,
  ShieldAlert,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LabWayLogo } from './LabWayLogo';

interface DashboardLayoutProps {
  currentPath: string;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentPath,
  navigate,
  children
}) => {
  const { user, logout } = useAuth();
  const { isDark, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Overview', path: '/dashboard/overview', icon: LayoutDashboard },
    { label: 'API Keys', path: '/dashboard/api-keys', icon: Key },
    { label: 'Usage', path: '/dashboard/usage', icon: BarChart3 },
    { label: 'Datasets', path: '/dashboard/datasets', icon: Database },
    { label: 'Billing', path: '/dashboard/billing', icon: CreditCard },
    { label: 'Documentation', path: '/docs', icon: BookOpen, external: false },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPageTitle = () => {
    if (currentPath.includes('/api-keys')) return 'API Key Credentials';
    if (currentPath.includes('/usage')) return 'Telemetry & Usage Metering';
    if (currentPath.includes('/datasets')) return 'Connected Datasets';
    if (currentPath.includes('/billing')) return 'Subscription & Quotas';
    if (currentPath.includes('/settings')) return 'Account Settings';
    return 'Developer Overview';
  };

  return (
    <div className="min-h-screen bg-[#070809] text-[#F4F5F2] flex flex-col md:flex-row font-sans selection:bg-[#5B82FF]/30 selection:text-white">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/[0.08] bg-[#0D0F12] sticky top-0 z-30">
        <div className="flex items-center gap-2.5" onClick={() => navigate('/dashboard')}>
          <LabWayLogo size="sm" />
          <span className="font-display font-semibold text-sm text-[#F4F5F2]">LabWay</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 shrink-0 border-r border-white/[0.08] bg-[#0D0F12] flex flex-col justify-between transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top brand */}
        <div className="p-5 border-b border-white/[0.08]">
          <div
            onClick={() => {
              navigate('/');
              setMobileOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <LabWayLogo size="md" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-sm tracking-tight text-[#F4F5F2]">
                  LabWay
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                  CORE
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono">Workspace</p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.path;
            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all relative ${
                  active
                    ? 'bg-[#12151A] text-white border border-white/[0.1] shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#5B82FF] rounded-r"></span>
                )}
                <Icon className={`w-4 h-4 ${active ? 'text-[#5B82FF]' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {user?.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-white/[0.08]">
              <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#5B82FF]">
                Administration
              </div>
              <button
                onClick={() => {
                  navigate('/admin');
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentPath.startsWith('/admin')
                    ? 'bg-[#5B82FF]/10 text-[#5B82FF] border border-[#5B82FF]/30 font-semibold'
                    : 'text-zinc-400 hover:text-[#5B82FF] hover:bg-[#5B82FF]/5'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-[#5B82FF]" />
                <span>Admin Console</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-white/[0.08] bg-[#070809] space-y-3">
          {/* User Profile Card */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#12151A] border border-white/[0.1] flex items-center justify-center font-mono font-bold text-xs text-[#F4F5F2] shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold truncate text-[#F4F5F2]">{user?.name || 'Developer'}</p>
                <p className="text-[11px] text-zinc-500 truncate font-mono">{user?.email}</p>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-[#5B82FF]/15 text-[#5B82FF] border border-[#5B82FF]/30">
              {user?.plan_id || 'Free'}
            </span>
          </div>

          {/* Controls: Theme & Logout */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors font-mono text-[11px]"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-zinc-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2 py-1 rounded text-rose-400 hover:bg-rose-500/10 transition-colors font-mono text-[11px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#070809]">
        {/* Top Action Header */}
        <header className="h-16 border-b border-white/[0.08] bg-[#0D0F12]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-zinc-500">LabWay</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="font-semibold text-zinc-200">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#12151A] border border-white/[0.08] text-zinc-300 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#5B82FF] animate-pulse"></span>
              Live Gateway Active
            </div>

            <button
              onClick={() => navigate('/docs')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] bg-[#12151A] text-xs font-medium text-zinc-300 hover:text-white hover:border-white/[0.2] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#5B82FF]" />
              API Specs
            </button>
          </div>
        </header>

        {/* Dynamic Page Children */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
