import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {type AuthCheckResponse, authService, type User} from "@/lib/auth.ts";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authStatus: AuthCheckResponse | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  initializeAdmin: (username: string, email: string, password: string) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthCheckResponse | null>(null);

  const checkAuthStatus = async () => {
    try {
      const status = await authService.checkAuthStatus();
      setAuthStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to check auth status:', error);
      throw error;
    }
  };

  const verifyAuth = async () => {
    if (authService.isAuthenticated()) {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to verify authentication:', error);
        authService.clearAuth();
        setUser(null);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const initialize = async () => {
      await checkAuthStatus();
      await verifyAuth();
    };
    initialize();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password);
      setUser(response.user);
      await checkAuthStatus();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const initializeAdmin = async (username: string, email: string, password: string) => {
    try {
      await authService.initializeAdmin(username, email, password);
      // Now login with the new admin credentials
      await login(username, password);
      await checkAuthStatus();
    } catch (error) {
      console.error('Admin initialization failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    authStatus,
    login,
    logout,
    initializeAdmin,
    checkAuthStatus,
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

