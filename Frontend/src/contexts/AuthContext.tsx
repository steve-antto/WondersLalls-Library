import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'LIBRARIAN' | 'STUDENT';
  activeStatus: boolean;
  studentProfile?: {
    _id: string;
    department: string;
    rollNumber: string;
    libraryCardNumber: string;
    borrowLimit: number;
    fineAmount: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken || storedToken === 'undefined') {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.data?.success && response.data.data?.user) {
        const userData = response.data.data.user;
        const studentProfile = response.data.data.studentProfile;
        setUser({
          ...userData,
          _id: userData.id || userData._id,
          studentProfile
        });
        setToken(storedToken);
      } else {
        logout();
      }
    } catch (error: any) {
      console.error('Session verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.success && response.data.data) {
        const receivedToken = response.data.data.token;
        const userData = response.data.data.user;
        const studentProfile = response.data.data.studentProfile;
        const receivedUser = {
          ...userData,
          _id: userData.id || userData._id,
          studentProfile
        };
        
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        toast.success(`Welcome back, ${receivedUser.name}!`);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      throw error;
    }
  };

  const register = async (formData: any) => {
    try {
      const response = await api.post('/auth/register', formData);
      if (response.data?.success) {
        toast.success('Registration successful! Please sign in.');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed. Try again.';
      toast.error(msg);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
