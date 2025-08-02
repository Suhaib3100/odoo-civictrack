'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api, TokenManager, User } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (TokenManager.isAuthenticated()) {
          const currentUser = await api.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        TokenManager.clearTokens();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.login({ email, password });
      setUser(response.data.user);
      toast.success('Login successful!');
      router.push('/map');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { email: string; password: string; firstName?: string; lastName?: string }) => {
    try {
      setLoading(true);
      const response = await api.register(userData);
      setUser(response.data.user);
      toast.success('Registration successful!');
      router.push('/map');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.logout();
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear user state even if API call fails
      setUser(null);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      setLoading(true);
      const updatedUser = await api.updateProfile(profileData);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      await api.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      await api.forgotPassword(email);
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setLoading(true);
      await api.resetPassword(token, newPassword);
      toast.success('Password reset successfully!');
      router.push('/login');
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isModerator: user?.role === 'MODERATOR' || user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 