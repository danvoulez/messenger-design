'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  displayName: string;
  tenantId: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setAuthToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    const token = localStorage.getItem('ubl_session_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/id/whoami', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUser({
            id: data.sid,
            username: data.username,
            displayName: data.display_name,
            tenantId: data.tenant_id || 'T.UBL',
          });
        } else {
          localStorage.removeItem('ubl_session_token');
        }
      } else {
        localStorage.removeItem('ubl_session_token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('ubl_session_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const setAuthToken = (token: string) => {
    localStorage.setItem('ubl_session_token', token);
  };

  const login = async () => {
    // Login is handled by WebAuthn flow in the login page
    // This is just a placeholder
    throw new Error('Use WebAuthn login flow');
  };

  const logout = async () => {
    const token = localStorage.getItem('ubl_session_token');
    if (token) {
      try {
        await fetch('/api/id/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }

    localStorage.removeItem('ubl_session_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
        setAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
