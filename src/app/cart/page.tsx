'use client';

import React from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, clearCart, cartSubtotal, cartTotal, deliveryCharge, otherCharge } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleCheckout = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Your Cart 💖
            </h1>
            <p className="text-foreground/70 text-lg">
              {cart.length === 0 ? 'Your cart is empty' : `${cart.length} item${cart.length !== 1 ? 's' : ''} in your cart`}
            </p>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-foreground/70 mb-8">Your cart is empty</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/#gallery"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-rose-gold to-blush-pink text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Browse Gallery
                </Link>
                <Link
                  href="/custom-order"
                  className="inline-block px-6 py-3 border-2 border-rose-gold text-foreground rounded-full font-medium hover:bg-rose-gold/10 transition-all duration-300 hover:scale-105"
                >
                  Custom Order
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item, index) => (
                <div
                  key={item.id}
                  className="glass-card rounded-2xl p-6 flex gap-6 items-center"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-baby-pink to-blush-pink">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        💅
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      {item.name}
                    </h3>
                    <p className="text-foreground/70 text-sm mb-2">
                      ₹{item.price}
                    </p>
                    {item.inspirationImage && (
                      <div className="text-xs text-foreground/50 mb-1">
                        ✨ Custom design with inspiration
                      </div>
                    )}
                    {item.nailShape && (
                      <div className="text-xs text-foreground/50">
                        📏 Shape: {item.nailShape}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-foreground/50 hover:text-red-500 transition-colors"
                    title="Remove from cart"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}

              <div className="glass-card rounded-2xl p-6 mt-8">
                <div className="bg-rose-gold/10 rounded-xl p-4 mb-6">
                  <p className="text-sm text-foreground/80 flex items-center gap-2">
                    <svg className="w-5 h-5 text-rose-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Shipping typically takes 10-20 days</span>
                  </p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/70">Subtotal</span>
                    <span className="font-medium text-foreground">₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/70">Delivery Charge</span>
                    <span className="font-medium text-foreground">₹{deliveryCharge}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/70">Other</span>
                    <span className="font-medium text-foreground">₹{otherCharge}</span>
                  </div>
                  <div className="border-t border-rose-gold/20 pt-3 flex justify-between items-center">
                    <span className="text-foreground font-semibold">Total</span>
                    <span className="font-serif text-2xl font-bold text-foreground">₹{cartTotal}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={clearCart}
                    className="flex-1 px-6 py-3 border border-rose-gold/30 text-foreground rounded-full font-medium hover:bg-rose-gold/10 transition-all duration-300"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-gold to-blush-pink text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
