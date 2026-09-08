import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api, getStoredToken, setStoredToken } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, confirm: string) => Promise<void>;
  logout: () => void;
  demoLogin: (type: 'admin' | 'developer') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  demoLogin: async () => {},
  refreshUser: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.auth.me();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setStoredToken(null);
        setUser(null);
      }
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.auth.login(email, pass);
    if (res.token) {
      setStoredToken(res.token);
      setUser(res.user);
    }
  };

  const register = async (name: string, email: string, pass: string, confirm: string) => {
    const res = await api.auth.register(name, email, pass, confirm);
    if (res.token) {
      setStoredToken(res.token);
      setUser(res.user);
    }
  };

  const demoLogin = async (type: 'admin' | 'developer') => {
    const res = await api.auth.demoLogin(type);
    if (res.token) {
      setStoredToken(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, demoLogin, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
