"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { adminLogin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await adminLogin(username, password);
    if (success) {
      router.push('/admin');
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-100 to-pink-200">
      <div className="glass-card p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Admin Login</h1>
          <p className="text-foreground/60">The Pinkie Swear Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
              Email or Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg glass-input focus:outline-none focus:ring-2 focus:ring-rose-gold"
              placeholder="snehakushi31@gmail.com or thepinkieswear"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg glass-input focus:outline-none focus:ring-2 focus:ring-rose-gold"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-rose-gold to-pink-300 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Login as Admin
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-rose-gold hover:underline text-sm">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
