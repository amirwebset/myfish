import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ikanku_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ikanku_token'));
  const [loading, setLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('ikanku_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          setUser(null);
          setToken(null);
          localStorage.removeItem('ikanku_token');
          localStorage.removeItem('ikanku_user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/login', { email, password });
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('ikanku_token', res.data.token);
        localStorage.setItem('ikanku_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || 'Login gagal.' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan saat masuk. Periksa email dan kata sandi Anda.';
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/register', userData);
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('ikanku_token', res.data.token);
        localStorage.setItem('ikanku_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || 'Pendaftaran gagal.' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registrasi gagal. Mohon periksa isian data Anda.';
      const errors = err.response?.data?.errors;
      return { success: false, message: msg, errors };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/logout');
      }
    } catch (err) {
      console.warn('Logout API error:', err.message);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('ikanku_token');
      localStorage.removeItem('ikanku_user');
    }
  };

  const updateProfile = async (formData) => {
    try {
      const res = await api.put('/me/profile', formData);
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('ikanku_user', JSON.stringify(res.data.user));
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memperbarui profil.';
      return { success: false, message: msg };
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
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
