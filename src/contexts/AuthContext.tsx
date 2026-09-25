import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'digitalsales_demo_session';
const DEMO_EMAIL = 'admin@admin.com';
const DEMO_PASSWORD = 'admin';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Restore authenticated session on mount/refresh
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (storedSession) {
        const parsedUser: User = JSON.parse(storedSession);
        setAuthState({
          user: parsedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return;
      }
    } catch (err) {
      console.error('Failed to parse stored session:', err);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Demo Admin Login Handler
   * Validates exact credentials: admin@admin.com / admin
   * No OTP, no email, no external dependencies required.
   */
  const login = async (
    email: string,
    password: string,
    _rememberMe = true
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    // Small delay to provide a realistic, polished loading state
    await new Promise((resolve) => setTimeout(resolve, 350));

    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const demoAdminUser: User = {
        id: 'usr_demo_admin',
        email: DEMO_EMAIL,
        name: 'Admin',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };

      // Persist session to survive browser refreshes
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoAdminUser));

      setAuthState({
        user: demoAdminUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    }

    // Invalid credentials entered
    const errorMessage = 'Invalid email or password.';
    setAuthState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
    return { success: false, error: errorMessage };
  };

  /**
   * Logout Handler
   * Clears stored session state and resets context
   */
  const logout = async (): Promise<void> => {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        isSupabaseConnected: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

