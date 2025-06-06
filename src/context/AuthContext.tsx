import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService, userService } from '../services/api';
import type { User, AuthResponse } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
    blood_type: string;
    is_donor: boolean;
    address: string;
    latitude: number;
    longitude: number;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
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
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Check for existing token in localStorage
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          // Fetch user data if token exists
          const response = await userService.getProfile();
          setUser(response);
        } catch (error) {
          // If token is invalid, clear it
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setInitializing(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    const { user: userData, token: newToken } = response;
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
    blood_type: string;
    is_donor: boolean;
    address: string;
    latitude: number;
    longitude: number;
  }) => {
    const response = await authService.register(data);
    const { user: userData, token: newToken } = response;
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    initializing,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 