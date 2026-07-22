'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin', icon: '📊', exact: true },
  { name: 'Edit Gallery', href: '/admin/products', icon: '🖼️', exact: false },
  { name: 'Orders', href: '/admin/orders', icon: '📦', exact: true },
  { name: 'Rejected Orders', href: '/admin/rejected-orders', icon: '❌', exact: false },
  { name: 'Reviews', href: '/admin/reviews', icon: '⭐', exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, authReady, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (authReady && !isAdmin) {
      router.push('/admin-login');
    }
  }, [authReady, isAdmin, router]);

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Orders', href: '/admin/orders', icon: '📦' },
    { name: 'Products', href: '/admin/products', icon: '💅' },
    { name: 'Customers', href: '/admin/customers', icon: '👥' },
    { name: 'Payments', href: '/admin/payments', icon: '💳' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-2 font-semibold">Loading admin session...</p>
          <p className="text-sm text-foreground/50">Checking your credentials</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <p className="text-foreground mb-4 font-semibold">Admin access required</p>
          <button
            onClick={() => router.push('/admin-login')}
            className="px-6 py-3 bg-gradient-to-r from-rose-gold to-blush-pink text-white rounded-xl font-medium"
          >
            Admin Login
          </button>
        </div>
      </div>
    );
  }

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const SidebarNav = ({ collapsed }: { collapsed: boolean }) => (
    <>
      <div className={`p-4 border-b border-rose-gold/10 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <span className="text-2xl">💅</span>
        {!collapsed && (
          <div>
            <h1 className="font-serif font-bold text-rose-gold text-base leading-tight">Admin Panel</h1>
            <p className="text-xs text-foreground/40">The Pinkie Swear</p>
          </div>
        )}
      </div>
      <nav className="p-3 space-y-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm
              ${collapsed ? 'justify-center' : ''}
              ${isActive(item)
                ? 'bg-rose-gold text-white shadow-md'
                : 'text-foreground/60 hover:bg-rose-gold/10 hover:text-rose-gold'}`}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-rose-gold/10 space-y-1">
        <button
          onClick={() => router.push('/')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-sm font-medium text-foreground/50 hover:bg-gray-100 hover:text-foreground ${collapsed ? 'justify-center' : ''}`}
        >
          <span className="text-xl">🏠</span>
          {!collapsed && <span>View Store</span>}
        </button>
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 ${collapsed ? 'justify-center' : ''}`}
        >
          <span className="text-xl">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-white shadow-lg z-50 transition-all duration-300 ${sidebarOpen ? 'w-60' : 'w-16'}`}>
        <SidebarNav collapsed={!sidebarOpen} />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 bg-white shadow-2xl flex flex-col">
            <SidebarNav collapsed={false} />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-60' : 'lg:ml-16'}`}>
        <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-rose-gold/10">
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 hover:bg-rose-gold/10 rounded-lg">
                <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block p-2 hover:bg-rose-gold/10 rounded-lg">
                <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-foreground">thepinkieswear</p>
                <p className="text-xs text-foreground/50">Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-rose-gold to-blush-pink flex items-center justify-center text-white font-bold text-sm">A</div>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 flex-1">{children}</div>
      </main>
    </div>
  );
}
