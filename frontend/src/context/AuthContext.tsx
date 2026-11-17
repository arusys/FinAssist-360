import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  deactivationError: string | null;
  clearDeactivationError: () => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('finassist_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deactivationError, setDeactivationError] = useState<string | null>(null);

  const clearDeactivationError = () => setDeactivationError(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('finassist_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.is_active === false) {
            setDeactivationError('Your account has been deactivated by the administrator. Contact support to re-activate.');
            logout();
          } else {
            setUser(res.data);
          }
        } catch (err: any) {
          if (err.response?.status === 403) {
            setDeactivationError('Your account has been deactivated by the administrator. Contact support to re-activate.');
            logout();
          } else {
            console.warn('Token validation failed, falling back to default admin user');
            await loginWithRole('admin', 'Admin@123');
          }
        }
      } else {
        // Auto-login with admin demo account on first load so user immediately sees functional app
        await loginWithRole('admin', 'Admin@123');
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const loginWithRole = async (u: string, p: string) => {
    setDeactivationError(null);
    try {
      const res = await api.post('/auth/login', { username: u, password: p });
      const { access_token, user: userData } = res.data;
      if (userData && userData.is_active === false) {
        setDeactivationError(`User account '${u}' is deactivated. Only active accounts can access FinAssist 360.`);
        logout();
        return;
      }
      localStorage.setItem('finassist_token', access_token);
      setToken(access_token);
      setUser(userData);
    } catch (e: any) {
      if (e.response?.status === 403) {
        setDeactivationError(e.response?.data?.detail || `Account '${u}' is deactivated by administrator.`);
        logout();
      } else {
        console.error('Login failed', e);
      }
    }
  };

  const login = async (username: string, password: string) => {
    setDeactivationError(null);
    try {
      const res = await api.post('/auth/login', { username, password });
      const { access_token, user: userData } = res.data;
      if (userData && userData.is_active === false) {
        setDeactivationError(`User account '${username}' is deactivated. Only active accounts can access FinAssist 360.`);
        logout();
        throw new Error('Account deactivated');
      }
      localStorage.setItem('finassist_token', access_token);
      setToken(access_token);
      setUser(userData);
    } catch (e: any) {
      if (e.response?.status === 403) {
        setDeactivationError(e.response?.data?.detail || 'Account deactivated.');
      }
      throw e;
    }
  };

  const logout = () => {
    localStorage.removeItem('finassist_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoRole = async (role: UserRole) => {
    setIsLoading(true);
    let u = 'admin';
    let p = 'Admin@123';
    if (role === 'Banking Operations Manager' || role === 'Service Manager') {
      u = 'manager';
      p = 'Manager@123';
    } else if (role === 'Service Desk Agent' || role === 'Banking Support Agent') {
      u = 'agent';
      p = 'Agent@123';
    } else if (role === 'Technical Support Engineer') {
      u = 'tech';
      p = 'Tech@123';
    } else if (role === 'Operations Analyst') {
      u = 'analyst';
      p = 'Analyst@123';
    } else if (role === 'User' || role === 'Customer') {
      u = 'user';
      p = 'User@123';
    } else if (role === 'Super Admin' || role === 'Admin') {
      u = 'admin';
      p = 'Admin@123';
    }
    await loginWithRole(u, p);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, deactivationError, clearDeactivationError, login, logout, switchDemoRole }}>
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
