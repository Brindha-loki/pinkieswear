'use client';

import React, { useEffect, useState } from 'react';
import insforge from '@/lib/insforge';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    rejectedOrders: 0,
    galleryProducts: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total orders (excluding rejected/cancelled)
      const { data: ordersData } = await insforge.database
        .from('orders')
        .select('id')
        .neq('status', 'Cancelled');

      // Fetch rejected orders (status = 'Cancelled')
      const { data: rejectedData } = await insforge.database
        .from('orders')
        .select('id')
        .eq('status', 'Cancelled');

      // Fetch gallery products
      const { data: productsData } = await insforge.database
        .from('gallery_products')
        .select('id');

      // Fetch users
      const { data: usersData } = await insforge.database
        .from('customers')
        .select('id');

      setStats({
        totalOrders: ordersData?.length || 0,
        rejectedOrders: rejectedData?.length || 0,
        galleryProducts: productsData?.length || 0,
        users: usersData?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Dashboard</h1>

      {loading ? (
        <div className="text-center py-12">Loading dashboard...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-rose-gold/20 flex items-center justify-center text-2xl">
                📦
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Rejected Orders</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejectedOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-2xl">
                ❌
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Gallery Products</p>
                <p className="text-3xl font-bold text-purple-600">{stats.galleryProducts}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">
                �
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Users</p>
                <p className="text-3xl font-bold text-blue-600">{stats.users}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">
                �
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/admin/orders"
              className="block p-4 bg-rose-gold/10 rounded-xl hover:bg-rose-gold/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📦</span>
                <div>
                  <p className="font-medium text-foreground">View Orders</p>
                  <p className="text-sm text-foreground/60">Manage and track orders</p>
                </div>
              </div>
            </a>
            <a
              href="/admin/products"
              className="block p-4 bg-purple-500/10 rounded-xl hover:bg-purple-500/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💅</span>
                <div>
                  <p className="font-medium text-foreground">Manage Products</p>
                  <p className="text-sm text-foreground/60">Add, edit, or remove products</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="text-center py-8 text-foreground/60">
            <p>Activity tracking coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
