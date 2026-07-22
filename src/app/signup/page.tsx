"use client";

import React, { useState } from 'react';
import { useAuth } from '../../lib/AuthContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !username || !phone || !password) {
      setError('Please fill all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    console.log('[SignupPage] submit');
    try {
      await signup(email.trim(), username.trim(), phone.trim(), password.trim());
    } catch (err: any) {
      if (err.message.includes('rate limit') || err.message.includes('security') || err.message.includes('seconds')) {
        setError('Too many signup attempts. Please wait a few minutes and try again, or use a different email address.');
      } else {
        setError(err.message || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-baby-pink to-white/60">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white/70 backdrop-blur-lg border border-rose-gold/10 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-semibold mb-6">Create an account</h1>

        <div className="space-y-4 mb-4">
          <label className="block text-sm font-medium text-foreground">Email (Gmail preferred)</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@gmail.com"
            className="w-full border border-rose-gold/20 bg-white/90 px-4 py-3 rounded-2xl text-foreground outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20"
          />
        </div>

        <div className="space-y-4 mb-4">
          <label className="block text-sm font-medium text-foreground">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            className="w-full border border-rose-gold/20 bg-white/90 px-4 py-3 rounded-2xl text-foreground outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20"
          />
        </div>

        <div className="space-y-4 mb-4">
          <label className="block text-sm font-medium text-foreground">Phone number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="(123) 456-7890"
            className="w-full border border-rose-gold/20 bg-white/90 px-4 py-3 rounded-2xl text-foreground outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20"
          />
        </div>

        <div className="space-y-4 mb-6">
          <label className="block text-sm font-medium text-foreground">Create password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Create a strong password"
            className="w-full border border-rose-gold/20 bg-white/90 px-4 py-3 rounded-2xl text-foreground outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full px-4 py-3 bg-rose-gold text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-xs text-foreground/70 mt-5">
          Already have an account? <a href="/login" className="font-medium text-rose-gold underline">Sign in</a>
        </p>
      </form>
    </div>
  );
}
