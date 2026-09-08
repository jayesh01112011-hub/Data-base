import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, Eye, EyeOff, AlertCircle, ShieldAlert, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LabWayLogo } from '../components/LabWayLogo';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login, demoLogin } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      showToast('Logged in successfully', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (type: 'developer' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(type);
      showToast(`Logged in as ${type === 'admin' ? 'System Administrator' : 'Developer'}`, 'success');
      if (type === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070809] text-[#F4F5F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div
          onClick={() => navigate('/')}
          className="inline-flex items-center justify-center cursor-pointer mb-5 group"
        >
          <LabWayLogo size="lg" />
        </div>
        <h2 className="text-2xl font-bold text-[#F4F5F2] tracking-tight font-display">
          Authenticate with LabWay
        </h2>
        <p className="mt-2 text-xs text-zinc-400">
          Or{' '}
          <button
            onClick={() => navigate('/register')}
            className="font-medium text-[#5B82FF] hover:underline"
          >
            create a developer account
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0D0F12] py-8 px-6 shadow-2xl sm:rounded-xl border border-white/[0.08] sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-white/[0.1] bg-[#12151A] text-[#F4F5F2] focus:outline-none focus:border-[#5B82FF] focus:ring-1 focus:ring-[#5B82FF]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => showToast('Password reset instructions sent to registered email in production', 'info')}
                  className="text-[11px] text-[#5B82FF] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-9 py-2 text-xs rounded-lg border border-white/[0.1] bg-[#12151A] text-[#F4F5F2] focus:outline-none focus:border-[#5B82FF] focus:ring-1 focus:ring-[#5B82FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold bg-[#5B82FF] hover:bg-[#6F92FF] text-white shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign in'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-6 border-t border-white/[0.08]">
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 text-center mb-3">
              1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemo('developer')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-white/[0.08] bg-[#12151A] hover:bg-white/[0.05] text-xs font-medium text-zinc-200 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#5B82FF]" />
                <span>Developer</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemo('admin')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-xs font-medium text-amber-400 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 text-center mt-2 font-mono">
              Pre-seeded with real database keys & 24k API requests
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

