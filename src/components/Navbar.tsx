import React, { useState } from 'react';
import { Sun, Moon, ArrowRight, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { LabWayLogo } from './LabWayLogo';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { isDark, setTheme } = useTheme();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const navLinks = [
    { label: 'Products', path: '/#products' },
    { label: 'Datasets', path: '/datasets' },
    { label: 'Documentation', path: '/docs' },
    { label: 'Pricing', path: '/pricing' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#070809]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center cursor-pointer select-none"
        >
          <LabWayLogo size="md" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 font-sans">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.label}
                onClick={() => {
                  if (link.path.startsWith('/#')) {
                    navigate('/');
                    setTimeout(() => {
                      const el = document.getElementById(link.path.replace('/#', ''));
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    navigate(link.path);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                  isActive
                    ? 'text-[#F4F5F2] bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                    : 'text-zinc-400 hover:text-[#F4F5F2] hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-colors"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-zinc-300" />}
          </button>

          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#12151A] hover:bg-[#181C22] text-[#F4F5F2] border border-white/[0.12] transition-all hover:border-[#5B82FF]/50"
            >
              Console
              <ArrowRight className="w-3.5 h-3.5 text-[#5B82FF]" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#5B82FF] hover:bg-[#6F92FF] text-white transition-all shadow-[0_1px_10px_rgba(91,130,255,0.25)] active:scale-[0.98]"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-400 hover:bg-white/[0.06]"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-zinc-300" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-300 hover:bg-white/[0.06]"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#0D0F12] px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => {
                setMobileMenuOpen(false);
                if (link.path.startsWith('/#')) {
                  navigate('/');
                  setTimeout(() => {
                    const el = document.getElementById(link.path.replace('/#', ''));
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else {
                  navigate(link.path);
                }
              }}
              className="block w-full text-left px-3.5 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.05]"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium bg-[#12151A] text-white border border-white/[0.12]"
              >
                Go to Console
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full py-2 rounded-lg text-xs font-medium text-zinc-200 border border-white/[0.1] hover:bg-white/[0.04]"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                  className="w-full py-2 rounded-lg text-xs font-medium bg-[#5B82FF] hover:bg-[#6F92FF] text-white"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

