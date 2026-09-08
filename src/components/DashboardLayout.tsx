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
  ExternalLink,
  Zap,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

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
    if (currentPath.includes('/billing')) return 'Subscription & Billing';
    if (currentPath.includes('/settings')) return 'Account Settings';
    return 'Developer Overview';
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row transition-colors">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-30">
        <div className="flex items-center gap-2" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950">
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-semibold text-sm">DataFlow API</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/95 flex flex-col justify-between transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top brand */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/80">
          <div
            onClick={() => {
              navigate('/');
              setMobileOpen(false);
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 shadow-sm transition-transform group-hover:scale-105">
              <Database className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                  DataFlow
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  API
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">Workspace</p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Platform
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
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-sm font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-400 dark:text-emerald-600' : 'text-zinc-400 dark:text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {user?.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-amber-500">
                Administration
              </div>
              <button
                onClick={() => {
                  navigate('/admin');
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPath.startsWith('/admin')
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Admin Console</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-3">
          {/* User Profile Card */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-200 shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold truncate text-zinc-900 dark:text-zinc-100">{user?.name || 'Developer'}</p>
                <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {user?.plan_id || 'Free'}
            </span>
          </div>

          {/* Controls: Theme & Logout */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-600" />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2 py-1 rounded text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Action Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400">Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Gateway (0.0.0.0:3000)
            </div>

            <button
              onClick={() => navigate('/docs')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
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
