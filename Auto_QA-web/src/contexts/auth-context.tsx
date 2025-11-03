/**
 * Authentication Context
 * Following Next.js rules: Use client-side context for authentication state
 * Now integrated with Redux for state management
 */

'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  login as loginAction,
  logout as logoutAction,
  setLoading,
  initializeAuth,
} from '@/redux/slices/authSlice';
import { secureStorage, STORAGE_KEYS } from '@/utils/secure-storage';

interface User {
  name: string;
  email: string;
  plan: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

type StoredAuthState = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Get auth state from Redux
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // Initialize auth state on mount from encrypted storage
  useEffect(() => {
    try {
      const stored =
        typeof window !== 'undefined'
          ? secureStorage.get<StoredAuthState>(STORAGE_KEYS.authState)
          : null;
      if (stored) {
        const parsed = stored;
        dispatch(
          initializeAuth({
            user: parsed.user ?? null,
            token: parsed.token ?? null,
            refreshToken: parsed.refreshToken ?? null,
            isAuthenticated: Boolean(parsed.isAuthenticated),
            isLoading: false,
          })
        );
        return;
      }
    } catch {
      // ignore corrupt storage and fallback to default
    }
    if (isLoading) {
      dispatch(setLoading(false));
    }
  }, [dispatch, isLoading]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const userData: User = {
          name: data.data.user.name,
          email: data.data.user.email,
          plan: data.data.user.role === 'admin' ? 'Premium' : 'Free',
        };

        // Align with backend: it returns `token` (no refresh token)
        const accessToken: string = data.data.token;
        const refreshToken: string = '';

        // Dispatch to Redux
        dispatch(
          loginAction({
            user: userData,
            token: accessToken,
            refreshToken,
          })
        );

        // Persist to encrypted storage for session continuity
        secureStorage.set(STORAGE_KEYS.authState, {
          user: userData,
          token: accessToken,
          refreshToken,
          isAuthenticated: true,
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    // Clear persisted auth and dispatch logout
    secureStorage.remove(STORAGE_KEYS.authState);
    dispatch(logoutAction());
    // Navigate to login without a full reload
    router.replace('/login');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component to protect routes
export function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '1.125rem',
            color: '#64748b',
          }}
        >
          Loading...
        </div>
      );
    }

    if (!isAuthenticated) {
      router.replace('/login');
      return null;
    }

    return <Component {...props} />;
  };
}
