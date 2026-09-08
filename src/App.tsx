import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DatasetsCatalogPage } from './pages/DatasetsCatalogPage';
import { DatasetDetailPage } from './pages/DatasetDetailPage';
import { DocsPage } from './pages/DocsPage';
import { PricingPage } from './pages/PricingPage';

// Layouts
import { DashboardLayout } from './components/DashboardLayout';
import { AdminLayout } from './components/AdminLayout';

// Dashboard Pages
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { ApiKeysPage } from './pages/dashboard/ApiKeysPage';
import { UsagePage } from './pages/dashboard/UsagePage';
import { DashboardDatasetsPage } from './pages/dashboard/DashboardDatasetsPage';
import { BillingPage } from './pages/dashboard/BillingPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

// Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminDatasetsPage } from './pages/admin/AdminDatasetsPage';
import { AdminIngestionPage } from './pages/admin/AdminIngestionPage';
import { AdminRevenuePage } from './pages/admin/AdminRevenuePage';
import { AdminSystemPage } from './pages/admin/AdminSystemPage';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname || '/'
  );

  // Sync with browser history back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 font-mono text-xs gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Initializing DataFlow API platform...</span>
      </div>
    );
  }

  // Handle Protected Dashboard Routes
  if (currentPath.startsWith('/dashboard')) {
    if (!user) {
      // If not logged in, prompt and render login
      return (
        <LoginPage
          navigate={navigate}
          onSuccess={() => navigate('/dashboard/overview')}
        />
      );
    }

    let pageComponent = <OverviewPage navigate={navigate} />;

    if (currentPath === '/dashboard/api-keys') {
      pageComponent = <ApiKeysPage />;
    } else if (currentPath === '/dashboard/usage') {
      pageComponent = <UsagePage />;
    } else if (currentPath === '/dashboard/datasets') {
      pageComponent = <DashboardDatasetsPage navigate={navigate} />;
    } else if (currentPath === '/dashboard/billing') {
      pageComponent = <BillingPage />;
    } else if (currentPath === '/dashboard/settings') {
      pageComponent = <SettingsPage />;
    }

    return (
      <DashboardLayout currentPath={currentPath} navigate={navigate}>
        {pageComponent}
      </DashboardLayout>
    );
  }

  // Handle Protected Admin Routes
  if (currentPath.startsWith('/admin')) {
    if (!user) {
      return (
        <LoginPage
          navigate={navigate}
          onSuccess={() => navigate('/admin/overview')}
        />
      );
    }

    if (user.role !== 'admin') {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 max-w-md space-y-3">
            <h2 className="text-lg font-bold text-rose-400">Access Restricted</h2>
            <p className="text-xs text-zinc-300">
              Your account ({user.email}) does not have administrative privileges. Please log in with an administrator account.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => navigate('/dashboard/overview')}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-xs font-semibold text-white hover:bg-zinc-700"
              >
                Go to Developer Dashboard
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Switch Account
              </button>
            </div>
          </div>
        </div>
      );
    }

    let adminComponent = <AdminOverviewPage navigate={navigate} />;

    if (currentPath === '/admin/users') {
      adminComponent = <AdminUsersPage />;
    } else if (currentPath === '/admin/datasets') {
      adminComponent = <AdminDatasetsPage />;
    } else if (currentPath === '/admin/ingestion') {
      adminComponent = <AdminIngestionPage />;
    } else if (currentPath === '/admin/revenue') {
      adminComponent = <AdminRevenuePage />;
    } else if (currentPath === '/admin/system') {
      adminComponent = <AdminSystemPage />;
    }

    return (
      <AdminLayout currentPath={currentPath} navigate={navigate}>
        {adminComponent}
      </AdminLayout>
    );
  }

  // Handle Dataset Detail Route: /datasets/:slug
  if (currentPath.startsWith('/datasets/') && currentPath !== '/datasets') {
    const slug = currentPath.replace('/datasets/', '').split('?')[0].split('#')[0];
    return <DatasetDetailPage slug={slug} navigate={navigate} />;
  }

  // Public Routes
  switch (currentPath) {
    case '/datasets':
      return <DatasetsCatalogPage navigate={navigate} />;
    case '/docs':
      return <DocsPage navigate={navigate} />;
    case '/pricing':
      return <PricingPage navigate={navigate} />;
    case '/login':
      return <LoginPage navigate={navigate} onSuccess={() => navigate('/dashboard/overview')} />;
    case '/register':
      return <RegisterPage navigate={navigate} onSuccess={() => navigate('/dashboard/overview')} />;
    case '/':
    default:
      return <LandingPage navigate={navigate} />;
  }
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
