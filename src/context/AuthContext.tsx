import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS, INITIAL_PERMISSIONS } from '../mock-data/msrf-data';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  hasPermission: (module: string, action: 'view' | 'create' | 'edit' | 'delete' | 'export') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default logged in as Super Admin for demo inspection
  const [user, setUser] = useState<UserProfile | null>(INITIAL_USERS[0]);
  const [role, setRole] = useState<UserRole>('SUPER_ADMIN');

  useEffect(() => {
    if (user) {
      setRole(user.role);
    }
  }, [user]);

  const login = async (email: string, _password: string, preferredRole?: UserRole): Promise<boolean> => {
    // Mock authentication delay
    await new Promise(res => setTimeout(res, 500));
    
    const targetRole = preferredRole || (email.includes('coach') ? 'COACH' : 'SUPER_ADMIN');
    const matchedUser = INITIAL_USERS.find(u => u.role === targetRole) || {
      id: `usr-${Date.now()}`,
      name: targetRole === 'SUPER_ADMIN' ? 'MSRF Director (Super Admin)' : 'Coach Rajesh Varma',
      email,
      role: targetRole,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      status: 'Active',
      lastLogin: 'Just now',
      createdAt: '2025-01-01',
      coachId: targetRole === 'COACH' ? 'coach-1' : undefined
    };

    setUser(matchedUser);
    setRole(targetRole);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    const matchedUser = INITIAL_USERS.find(u => u.role === newRole) || {
      id: `usr-${Date.now()}`,
      name: newRole === 'SUPER_ADMIN' ? 'MSRF Director (Super Admin)' : 'Coach Rajesh Varma',
      email: newRole === 'SUPER_ADMIN' ? 'admin@msrf.org' : 'rajesh.varma@msrf.org',
      role: newRole,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      status: 'Active',
      lastLogin: 'Just now',
      createdAt: '2025-01-01',
      coachId: newRole === 'COACH' ? 'coach-1' : undefined
    };
    setUser(matchedUser);
  };

  const hasPermission = (module: string, action: 'view' | 'create' | 'edit' | 'delete' | 'export'): boolean => {
    const roleDef = INITIAL_PERMISSIONS.find(p => p.role === role);
    if (!roleDef) return false;
    const group = roleDef.groups.find(g => g.module === module);
    if (!group) return false;
    return group[action] ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
        hasPermission
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
