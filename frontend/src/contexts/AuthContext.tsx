import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.login(email, password);

      if (response.data) {
        const loginData = response.data as { user: User; token: string };
        setUser(loginData.user);
        setToken(loginData.token);

        // Store in localStorage
        localStorage.setItem('authToken', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));

        return true;
      } else {
        setError(response.error || 'Login failed');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.register(username, email, password);

      if (response.data) {
        const registerData = response.data as { user: User; token: string };
        setUser(registerData.user);
        setToken(registerData.token);

        // Store in localStorage
        localStorage.setItem('authToken', registerData.token);
        localStorage.setItem('user', JSON.stringify(registerData.user));

        return true;
      } else {
        setError(response.error || 'Registration failed');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);

    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};