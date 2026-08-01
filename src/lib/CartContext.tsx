"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  shippingAddress?: string;
  inspirationImage?: string;
  nailSizeImages?: string[];
  designNotes?: string;
  nailShape?: string;
  sizingNotes?: string;
  threeDArtSelection?: string;
  orderId?: string;
  galleryProductId?: string;
}

export const DELIVERY_CHARGE = 70;

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTotal: number;
  deliveryCharge: number;
  otherCharge: number;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { authReady, isAdmin, userId } = useAuth();

  const storageKey = !authReady
    ? null
    : isAdmin
      ? `cart:admin:${userId || 'anonymous'}`
      : userId
        ? `cart:user:${userId}`
        : 'cart:guest';

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    try {
      const savedCart = localStorage.getItem(storageKey);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
        return;
      }

      if (!isAdmin) {
        const legacyCart = localStorage.getItem('cart');
        if (legacyCart) {
          setCart(JSON.parse(legacyCart));
          localStorage.setItem(storageKey, legacyCart);
          return;
        }
      }

      setCart([]);
    } catch (e) {
      setCart([]);
    }
  }, [isAdmin, storageKey]);

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  }, [cart, storageKey]);

  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, { ...item, id: `${item.id}-${Date.now()}` }]);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((total, item) => total + item.price, 0);
  const hasItems = cart.length > 0;
  const deliveryCharge = hasItems ? DELIVERY_CHARGE : 0;
  const otherCharge = 0;
  const cartTotal = cartSubtotal + deliveryCharge + otherCharge;
  const cartCount = cart.length;

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      cartSubtotal,
      cartTotal,
      deliveryCharge,
      otherCharge,
      cartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;
