import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (formData: any) => Promise<User>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
  sendOTP: (phoneOrEmail: string) => Promise<any>;
  loginWithOTP: (phoneOrEmail: string, otp: string) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  updateProfile: (profileData: { name: string; phone: string; landSize?: number; district?: string; state?: string }) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (basicUser: User): Promise<User> => {
    if (basicUser.role === 'farmer') {
      try {
        const { data } = await API.get('/farm/profile');
        if (data.profile) {
          return {
            ...basicUser,
            landSize: data.profile.landSize,
            soilType: data.profile.soilType,
            activeCrop: data.profile.activeCrop?.name || null,
            activeCropId: data.profile.activeCrop?._id || null,
            village: data.profile.village
          };
        }
      } catch (err: any) {
        // 404 is expected for new farmers who haven't set up a profile
        if (err?.response?.status !== 404) {
          console.error('Failed to fetch farm profile:', err);
        }
      }
    }
    return basicUser;
  };

  useEffect(() => {
    const initAuth = async () => {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (stored && token) {
        const basicUser = JSON.parse(stored);
        const fullUser = await fetchProfile(basicUser);
        setUser(fullUser);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    const fullUser = await fetchProfile(data.user);
    setUser(fullUser);
    return fullUser;
  };

  const register = async (formData: any): Promise<User> => {
    const { data } = await API.post('/auth/register', formData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    const fullUser = await fetchProfile(data.user);
    setUser(fullUser);
    return fullUser;
  };

  const sendOTP = async (phoneOrEmail: string): Promise<any> => {
    const { data } = await API.post('/auth/send-otp', { phoneOrEmail });
    return data;
  };

  const loginWithOTP = async (phoneOrEmail: string, otp: string): Promise<User> => {
    const { data } = await API.post('/auth/login-otp', { phoneOrEmail, otp });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    const fullUser = await fetchProfile(data.user);
    setUser(fullUser);
    return fullUser;
  };

  const loginWithGoogle = async (idToken: string): Promise<User> => {
    const { data } = await API.post('/auth/google-login', { idToken });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    const fullUser = await fetchProfile(data.user);
    setUser(fullUser);
    return fullUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (profileData: { name: string; phone: string; landSize?: number; district?: string; state?: string }): Promise<User> => {
    const { data } = await API.put('/auth/profile', { 
      name: profileData.name, 
      phone: profileData.phone,
      district: profileData.district,
      state: profileData.state
    });
    if (profileData.landSize !== undefined) {
      await API.post('/farm/profile', { landSize: profileData.landSize });
    }
    localStorage.setItem('user', JSON.stringify(data.user));
    const fullUser = await fetchProfile(data.user);
    setUser(fullUser);
    return fullUser;
  };

  const refreshUser = async () => {
    if (user) {
      const fullUser = await fetchProfile(user);
      setUser(fullUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser, sendOTP, loginWithOTP, loginWithGoogle, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
