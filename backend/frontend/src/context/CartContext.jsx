import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [formattedSubtotal, setFormattedSubtotal] = useState('Rp 0');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const fetchCart = useCallback(async () => {
    try {
      const res = await api.get('/cart');
      if (res.data.success) {
        setItems(res.data.items || []);
        setCount(res.data.total_quantity || 0);
        setSubtotal(res.data.subtotal || 0);
        setFormattedSubtotal(res.data.formatted_subtotal || 'Rp 0');
      }
    } catch (err) {
      console.warn('Failed to load cart items:', err.message);
    }
  }, []);

  // Re-fetch cart when user login status changes or on initial mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart, user]);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const res = await api.post('/cart/add', {
        product_id: productId,
        quantity,
      });

      if (res.data.success) {
        await fetchCart();
        showToast(res.data.message || 'Ikan berhasil ditambahkan ke keranjang!', 'success');
        return { success: true };
      }
      showToast(res.data.message || 'Gagal menambahkan ke keranjang.', 'error');
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menambahkan produk ke keranjang.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await api.put(`/cart/update/${cartItemId}`, { quantity });
      if (res.data.success) {
        await fetchCart();
        return { success: true };
      }
      showToast(res.data.message || 'Gagal memperbarui jumlah.', 'error');
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memperbarui jumlah.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await api.delete(`/cart/remove/${cartItemId}`);
      if (res.data.success) {
        await fetchCart();
        showToast('Item berhasil dihapus dari keranjang.', 'info');
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      showToast('Gagal menghapus item.', 'error');
      return { success: false };
    }
  };

  const clearCart = async () => {
    try {
      const res = await api.delete('/cart/clear');
      if (res.data.success) {
        await fetchCart();
        showToast('Keranjang belanja telah dikosongkan.', 'info');
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      showToast('Gagal mengosongkan keranjang.', 'error');
      return { success: false };
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        formattedSubtotal,
        loading,
        toast,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
