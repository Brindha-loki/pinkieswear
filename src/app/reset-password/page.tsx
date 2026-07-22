"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Invalid or missing reset token. Please use the link from your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    console.log('[ResetPasswordPage] submit');
    try {
      await resetPassword(token, newPassword);
      setSuccess('Your password has been reset. You can now sign in.');
    } catch (err: any) {
      setError(err.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-baby-pink to-white/60">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white/70 backdrop-blur-lg border border-rose-gold/10 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-semibold mb-6">Set a new password</h1>
        <p className="text-sm text-foreground/70 mb-6">Enter a new password to finish resetting your account.</p>
        <label className="block text-sm font-medium text-foreground mb-2">New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded-xl border border-rose-gold/20 bg-white/90 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none"
          placeholder="New password"
        />
        {error && <div className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-lg">{error}</div>}
        {success && <div className="text-sm text-green-700 mb-4 bg-green-50 p-3 rounded-lg">{success}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-rose-gold text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Resetting password...' : 'Reset password'}
        </button>
        <p className="text-center text-xs text-foreground/70 mt-5">
          Back to <a href="/login" className="font-medium text-rose-gold underline">Sign in</a>
        </p>
      </form>
    </div>
  );
}
