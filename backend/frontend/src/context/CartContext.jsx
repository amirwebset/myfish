import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { MOCK_PRODUCTS } from '../data/mockProducts';

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
      if (res.data?.success && Array.isArray(res.data.items) && res.data.items.length > 0) {
        setItems(res.data.items);
        setCount(res.data.total_quantity || 0);
        setSubtotal(res.data.subtotal || 0);
        setFormattedSubtotal(res.data.formatted_subtotal || 'Rp 0');
        return;
      }
    } catch (err) {
      console.warn('Backend cart unavailable, checking local storage cart:', err.message);
    }

    const saved = localStorage.getItem('ikanku_local_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          const totalQ = parsed.reduce((sum, i) => sum + i.quantity, 0);
          const totalSub = parsed.reduce((sum, i) => sum + i.subtotal, 0);
          setCount(totalQ);
          setSubtotal(totalSub);
          setFormattedSubtotal('Rp ' + Number(totalSub).toLocaleString('id-ID'));
        }
      } catch (e) {
        // ignore invalid JSON
      }
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

      if (res.data?.success) {
        await fetchCart();
        showToast(res.data.message || 'Ikan berhasil ditambahkan ke keranjang!', 'success');
        setLoading(false);
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend cart API unavailable, saving to local cart:', err.message);
    }

    // Local cart fallback
    const foundProduct = MOCK_PRODUCTS.find(p => p.id === productId || p.slug === productId);
    if (foundProduct) {
      setItems(prevItems => {
        const existing = prevItems.find(it => it.product_id === foundProduct.id);
        let updated;
        if (existing) {
          updated = prevItems.map(it =>
            it.product_id === foundProduct.id
              ? {
                  ...it,
                  quantity: it.quantity + quantity,
                  subtotal: (it.quantity + quantity) * it.price,
                  formatted_subtotal: 'Rp ' + Number((it.quantity + quantity) * it.price).toLocaleString('id-ID'),
                }
              : it
          );
        } else {
          const newItem = {
            id: Date.now(),
            product_id: foundProduct.id,
            name: foundProduct.name,
            price: foundProduct.price,
            formatted_price: foundProduct.formatted_price,
            quantity,
            subtotal: foundProduct.price * quantity,
            formatted_subtotal: 'Rp ' + Number(foundProduct.price * quantity).toLocaleString('id-ID'),
            image_url: foundProduct.image_url,
            stock: foundProduct.stock,
            is_in_stock: true,
            slug: foundProduct.slug,
          };
          updated = [...prevItems, newItem];
        }
        const totalQ = updated.reduce((sum, i) => sum + i.quantity, 0);
        const totalSub = updated.reduce((sum, i) => sum + i.subtotal, 0);
        setCount(totalQ);
        setSubtotal(totalSub);
        setFormattedSubtotal('Rp ' + Number(totalSub).toLocaleString('id-ID'));
        localStorage.setItem('ikanku_local_cart', JSON.stringify(updated));
        return updated;
      });
      showToast(`${foundProduct.name} ditambahkan ke keranjang!`, 'success');
      setLoading(false);
      return { success: true };
    }

    setLoading(false);
    return { success: false, message: 'Produk tidak ditemukan.' };
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await api.put(`/cart/update/${cartItemId}`, { quantity });
      if (res.data?.success) {
        await fetchCart();
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend cart update unavailable, updating local cart:', err.message);
    }

    setItems(prevItems => {
      const updated = prevItems.map(it => {
        if (it.id === cartItemId || it.product_id === cartItemId) {
          const newQ = quantity;
          return {
            ...it,
            quantity: newQ,
            subtotal: newQ * it.price,
            formatted_subtotal: 'Rp ' + Number(newQ * it.price).toLocaleString('id-ID'),
          };
        }
        return it;
      });
      const totalQ = updated.reduce((sum, i) => sum + i.quantity, 0);
      const totalSub = updated.reduce((sum, i) => sum + i.subtotal, 0);
      setCount(totalQ);
      setSubtotal(totalSub);
      setFormattedSubtotal('Rp ' + Number(totalSub).toLocaleString('id-ID'));
      localStorage.setItem('ikanku_local_cart', JSON.stringify(updated));
      return updated;
    });
    return { success: true };
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await api.delete(`/cart/remove/${cartItemId}`);
      if (res.data?.success) {
        await fetchCart();
        showToast('Item berhasil dihapus dari keranjang.', 'info');
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend cart remove unavailable, removing from local cart:', err.message);
    }

    setItems(prevItems => {
      const updated = prevItems.filter(it => it.id !== cartItemId && it.product_id !== cartItemId);
      const totalQ = updated.reduce((sum, i) => sum + i.quantity, 0);
      const totalSub = updated.reduce((sum, i) => sum + i.subtotal, 0);
      setCount(totalQ);
      setSubtotal(totalSub);
      setFormattedSubtotal('Rp ' + Number(totalSub).toLocaleString('id-ID'));
      localStorage.setItem('ikanku_local_cart', JSON.stringify(updated));
      return updated;
    });
    showToast('Item berhasil dihapus dari keranjang.', 'info');
    return { success: true };
  };

  const clearCart = async () => {
    try {
      const res = await api.delete('/cart/clear');
      if (res.data?.success) {
        await fetchCart();
        showToast('Keranjang belanja telah dikosongkan.', 'info');
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend cart clear unavailable, clearing local cart:', err.message);
    }

    setItems([]);
    setCount(0);
    setSubtotal(0);
    setFormattedSubtotal('Rp 0');
    localStorage.removeItem('ikanku_local_cart');
    showToast('Keranjang belanja telah dikosongkan.', 'info');
    return { success: true };
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
