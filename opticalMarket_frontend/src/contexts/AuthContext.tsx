'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        try {
          const { state } = JSON.parse(authData);
          if (state?.user && state?.token) {
            setUser(state.user);
            setToken(state.token);
          }
        } catch (error) {
          console.error('Failed to parse auth data:', error);
        }
      }
      setLoading(false);
    }
  }, []);

  const setAuth = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-storage', JSON.stringify({ state: { user, token } }));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
