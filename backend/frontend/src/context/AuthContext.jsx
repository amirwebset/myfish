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
        // Sesi demo admin/pelanggan dipertahankan tanpa perlu memanggil backend lokal
        if (token.startsWith('demo_')) {
          setLoading(false);
          return;
        }

        try {
          const res = await api.get('/me');
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('ikanku_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session check fallback:', err.message);
          // Hanya bersihkan jika bukan user demo
          if (!token.startsWith('demo_')) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('ikanku_token');
            localStorage.removeItem('ikanku_user');
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Prioritas Utama: Akun Demo Administrator Desa Pasanggar
    if (
      (cleanEmail === 'admin@pasanggarfish.com' && cleanPass === 'admin123') ||
      (cleanEmail === 'admin' && (cleanPass === 'admin123' || cleanPass === 'admin')) ||
      (cleanEmail === 'admin@ikanku.com' && cleanPass === 'admin123')
    ) {
      const demoAdmin = {
        id: 'admin_pasanggar_1',
        name: 'Administrator Desa Pasanggar',
        email: 'admin@pasanggarfish.com',
        role: 'admin',
        phone: '081249412813',
      };
      const fakeToken = 'demo_admin_' + Date.now();
      setUser(demoAdmin);
      setToken(fakeToken);
      localStorage.setItem('ikanku_token', fakeToken);
      localStorage.setItem('ikanku_user', JSON.stringify(demoAdmin));
      return { success: true, user: demoAdmin };
    }

    // 2. Akun Demo Pelanggan (Customer)
    if (
      (cleanEmail === 'pelanggan@gmail.com' && cleanPass === 'password123') ||
      (cleanEmail === 'pelanggan' && cleanPass === 'password123')
    ) {
      const demoCustomer = {
        id: 'customer_demo_1',
        name: 'Budi Santoso (Demo)',
        email: 'pelanggan@gmail.com',
        role: 'customer',
        phone: '081234567890',
        address: 'Jl. Raya Pasanggar No. 12, Pamekasan',
      };
      const fakeToken = 'demo_customer_' + Date.now();
      setUser(demoCustomer);
      setToken(fakeToken);
      localStorage.setItem('ikanku_token', fakeToken);
      localStorage.setItem('ikanku_user', JSON.stringify(demoCustomer));
      return { success: true, user: demoCustomer };
    }

    // 3. Coba autentikasi ke backend API lokal jika tersedia
    try {
      const res = await api.post('/login', { email: cleanEmail, password: cleanPass });
      if (res.data?.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('ikanku_token', res.data.token);
        localStorage.setItem('ikanku_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      console.warn('Backend login API offline:', err.message);
    }

    return { 
      success: false, 
      message: 'Email atau kata sandi tidak cocok. Gunakan admin@pasanggarfish.com dan password admin123, atau klik tombol Akses Cepat Demo di bawah.' 
    };
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
