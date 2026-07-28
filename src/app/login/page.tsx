"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get('insforge_status');
    const type = params.get('insforge_type');
    const errorParam = params.get('insforge_error');

    if (status === 'success' && type === 'verify_email') {
      setInfoMessage('Your email has been verified. Please sign in.');
    }

    if (status === 'error' && type === 'verify_email') {
      setError(errorParam || 'Email verification failed. Please try again.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LoginPage] submit');
    setError(null);
    setInfoMessage(null);

    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      // Redirect to the specified URL after successful login
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect');
      if (redirectUrl) {
        router.push(decodeURIComponent(redirectUrl));
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-baby-pink to-white/60">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white/70 backdrop-blur-lg border border-rose-gold/10 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-semibold mb-6">Welcome Back 💖</h1>
        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-3 rounded-xl border border-rose-gold/20 bg-white/90 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none"
          placeholder="your@email.com"
        />
        <label className="block text-sm font-medium text-foreground mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded-xl border border-rose-gold/20 bg-white/90 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none"
          placeholder="••••••••"
        />
        {error && <div className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-lg">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-gradient-to-r from-rose-gold to-blush-pink text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        {infoMessage && <div className="text-sm text-green-700 mb-4 bg-green-50 p-3 rounded-lg">{infoMessage}</div>}
        <p className="text-sm text-foreground/70 mt-4 text-center">
          Don't have an account? <a href="/signup" className="font-medium text-rose-gold hover:underline">Create one</a>
        </p>
        <p className="text-sm text-foreground/70 mt-2 text-center">
          <a href="/forgot-password" className="font-medium text-rose-gold hover:underline">Forgot your password?</a>
        </p>
      </form>
    </div>
  );
}
