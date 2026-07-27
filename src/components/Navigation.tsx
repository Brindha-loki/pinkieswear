'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import { useCart } from '../lib/CartContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'Gallery', href: '/#gallery' },
    { name: 'Tutorial', href: '/#tutorial' },
    { name: 'Reviews', href: '/#reviews' },
    { name: 'About', href: '/#about' },
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            The Pinkie Swear
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-foreground hover:text-rose-gold transition-colors duration-300 font-medium"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center space-x-4 ml-4">
              {user && (
                <Link
                  href="/cart"
                  className="relative text-foreground hover:text-rose-gold transition-colors duration-300"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-gold text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}
              {user ? (
                <div className="relative">
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center gap-2 text-foreground hover:text-rose-gold transition-colors duration-300 font-medium"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-rose-gold to-blush-pink flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 glass-card rounded-2xl shadow-xl overflow-hidden z-50">
                      <div className="p-4 border-b border-rose-gold/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-gold to-blush-pink flex items-center justify-center text-white font-semibold">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <p className="text-xs text-foreground/60">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs text-foreground/50 mb-1">Contact</div>
                        <div className="px-3 py-2 text-sm text-foreground/70">
                          📱 {user.phone}
                        </div>
                        <div className="border-t border-rose-gold/10 my-2"></div>
                        <Link
                          href="/my-orders"
                          className="block px-3 py-2 text-sm text-foreground hover:bg-rose-gold/10 rounded-lg transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          📦 My Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-rose-gold/10 rounded-lg transition-colors"
                        >
                          🚪 Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-foreground hover:text-rose-gold transition-colors duration-300 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-gradient-to-r from-rose-gold to-blush-pink text-white px-5 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 glass-card rounded-2xl">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block py-3 px-4 text-foreground hover:text-rose-gold transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-rose-gold/20 mt-2 pt-2">
              {user && (
                <Link
                  href="/cart"
                  className="flex items-center gap-2 py-3 px-4 text-foreground hover:text-rose-gold transition-colors duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
              )}
              {user ? (
                <>
                  <Link
                    href="/my-orders"
                    className="flex items-center gap-2 py-3 px-4 text-foreground hover:text-rose-gold transition-colors duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-3 px-4 text-foreground hover:text-rose-gold transition-colors duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block py-3 px-4 text-foreground hover:text-rose-gold transition-colors duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block py-3 px-4 text-rose-gold font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
