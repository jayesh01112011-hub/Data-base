import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LabWayLogo } from '../components/LabWayLogo';

interface RegisterPageProps {
  navigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'developer' | 'growth'>('free');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, confirmPassword);
      showToast('Account created! Your initial API key has been provisioned.', 'success');
      navigate('/dashboard/api-keys');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
          Create developer account
        </h2>
        <p className="mt-2 text-xs text-zinc-400">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-medium text-[#5B82FF] hover:underline"
          >
            Sign in
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
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Vance"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-white/[0.1] bg-[#12151A] text-[#F4F5F2] focus:outline-none focus:border-[#5B82FF] focus:ring-1 focus:ring-[#5B82FF]"
                />
              </div>
            </div>

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
                  placeholder="alex@company.com"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-white/[0.1] bg-[#12151A] text-[#F4F5F2] focus:outline-none focus:border-[#5B82FF] focus:ring-1 focus:ring-[#5B82FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-white/[0.1] bg-[#12151A] text-[#F4F5F2] focus:outline-none focus:border-[#5B82FF] focus:ring-1 focus:ring-[#5B82FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-white/[0.1] bg-[#12151A] text-[#F4F5F2] focus:outline-none focus:border-[#5B82FF] focus:ring-1 focus:ring-[#5B82FF]"
                />
              </div>
            </div>

            {/* Plan selector on onboarding */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">
                Select Initial Tier
              </label>
              <div className="grid grid-cols-3 gap-2 font-mono">
                {[
                  { id: 'free', name: 'Free', price: '₹0' },
                  { id: 'developer', name: 'Developer', price: '₹499' },
                  { id: 'growth', name: 'Growth', price: '₹1,499' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedPlan(tier.id as any)}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      selectedPlan === tier.id
                        ? 'border-[#5B82FF] bg-[#5B82FF]/10 text-[#5B82FF] font-semibold'
                        : 'border-white/[0.08] bg-[#12151A] text-zinc-400 hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="text-xs font-bold">{tier.name}</div>
                    <div className="text-[10px] text-zinc-500">{tier.price}/mo</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold bg-[#5B82FF] hover:bg-[#6F92FF] text-white shadow-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account & Generate Key'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <p className="mt-4 text-[11px] text-zinc-500 text-center">
            By registering, you agree to our Open Data Licensing Terms and Rate Metering Guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};

