import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { refreshAccessToken, tokenStore } from '../api/client';
import { authApi } from '../api/endpoints';
import { queryClient } from '../api/queryClient';
import type { ApiUser } from '../api/types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  /** True until the stored session (refresh cookie) has been checked on page load. */
  isLoading: boolean;
  /** Resolves with the signed-in user's role; rejects with ApiError on bad credentials. */
  login: (email: string, password: string) => Promise<UserRole>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toProfile = (u: ApiUser): UserProfile => ({
  id: u.id,
  name: u.fullName,
  email: u.email,
  role: u.role === 'ADMIN' ? 'SUPER_ADMIN' : 'COACH',
  avatar: '',
  status: u.isActive ? 'Active' : 'Inactive',
  lastLogin: u.lastLoginAt ?? '',
  createdAt: '',
  coachId: u.coachId ?? undefined,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session from the httpOnly refresh cookie, if there is one.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (await refreshAccessToken()) {
          const me = await authApi.me();
          if (!cancelled) setUser(toProfile(me));
        }
      } catch {
        tokenStore.set(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // A failed refresh mid-session (expired, revoked, account deactivated) signs the user out.
  useEffect(() => {
    tokenStore.onExpired(() => setUser(null));
    return () => tokenStore.onExpired(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    tokenStore.set(result.accessToken);
    queryClient.clear();
    const profile = toProfile(result.user);
    setUser(profile);
    return profile.role;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Clearing local state is what matters; the cookie expires on its own.
    }
    tokenStore.set(null);
    queryClient.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? 'SUPER_ADMIN',
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
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
