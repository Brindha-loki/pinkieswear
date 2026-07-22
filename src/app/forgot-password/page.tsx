"use client";

import React, { useState } from 'react';
import { useAuth } from '../../lib/AuthContext';

export default function ForgotPasswordPage() {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    console.log('[ForgotPasswordPage] submit');
    try {
      await sendPasswordResetEmail(email.trim());
      setSuccess('If that email is registered, a password reset link has been sent.');
    } catch (err: any) {
      setError(err.message || 'Password reset request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-baby-pink to-white/60">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white/70 backdrop-blur-lg border border-rose-gold/10 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-semibold mb-6">Reset your password</h1>
        <p className="text-sm text-foreground/70 mb-6">Enter the email associated with your account and we’ll send a reset link.</p>
        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded-xl border border-rose-gold/20 bg-white/90 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none"
          placeholder="your@email.com"
        />
        {error && <div className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-lg">{error}</div>}
        {success && <div className="text-sm text-green-700 mb-4 bg-green-50 p-3 rounded-lg">{success}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-rose-gold text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending reset email...' : 'Send reset email'}
        </button>
        <p className="text-center text-xs text-foreground/70 mt-5">
          Remembered your password? <a href="/login" className="font-medium text-rose-gold underline">Sign in</a>
        </p>
      </form>
    </div>
  );
}
