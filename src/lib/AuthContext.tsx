"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import insforge from './insforge';

type AuthContextType = {
  user?: { name: string; email?: string; phone?: string; id?: string } | null;
  isAdmin: boolean;
  authReady: boolean;
  userId?: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  signup: (email: string, username: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
};

type CustomerProfile = {
  id?: string;
  auth_id?: string;
  full_name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  username?: string;
};

type AdminProfile = {
  id?: string;
  auth_id?: string;
  role?: string;
  email?: string;
  username?: string;
};

type AuthUser = {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
};

const ADMIN_EMAIL_ALLOWLIST = new Set(['snehakushi31@gmail.com']);

const isAllowedAdminEmail = (email?: string) => {
  if (!email) return false;
  return ADMIN_EMAIL_ALLOWLIST.has(email.trim().toLowerCase());
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getCustomerProfile = async (authId: string) => {
  const { data, error } = await insforge.database
    .from('customers')
    .select('id, auth_id, full_name, phone, whatsapp, email, username')
    .eq('auth_id', authId)
    .limit(1);

  if (error) {
    return null;
  }

  const customer = Array.isArray(data) ? data[0] : data;
  return customer as CustomerProfile | null;
};

const getAdminProfile = async (authId: string) => {
  const { data, error } = await insforge.database
    .from('admin_users')
    .select('id, auth_id, role, email, username')
    .eq('auth_id', authId)
    .limit(1);

  if (error) {
    return null;
  }

  const admin = Array.isArray(data) ? data[0] : data;
  return admin as AdminProfile | null;
};

const ensureCustomerProfile = async (authUser: { id: string; email?: string; phone?: string; name?: string }, fallbackName: string) => {
  const normalizedUsername = (fallbackName || authUser.email?.split('@')[0] || `user-${authUser.id.slice(0, 8)}`)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '');

  const profilePayload = {
    auth_id: authUser.id,
    full_name: fallbackName || authUser.name || normalizedUsername || 'User',
    username: normalizedUsername || `user-${authUser.id.slice(0, 8)}`,
    phone: authUser.phone || '',
    whatsapp: authUser.phone || '',
    email: authUser.email || '',
  };

  const existing = await getCustomerProfile(authUser.id);
  if (existing) {
    return existing;
  }

  const { data, error } = await insforge.database
    .from('customers')
    .upsert([profilePayload], { onConflict: 'auth_id' })
    .select('id, auth_id, full_name, phone, whatsapp, email, username')
    .limit(1);

  if (error) {
    console.error('Customer profile sync error:', error);
    return null;
  }

  const created = Array.isArray(data) ? data[0] : data;
  return created as CustomerProfile | null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ name: string; email?: string; phone?: string; id?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const hydrateAuthenticatedUser = async (authUser: AuthUser) => {
    setUserId(authUser.id);

    const adminData = await getAdminProfile(authUser.id);

    if (adminData) {
      setIsAdmin(true);
      setUser({
        name: adminData.username || authUser.name || 'Admin',
        email: adminData.email || authUser.email,
        phone: authUser.phone || '',
        id: authUser.id,
      });
      return { isAdmin: true as const };
    }

    setIsAdmin(false);

    const customer = await getCustomerProfile(authUser.id);
    if (customer) {
      setUser({
        name: customer.full_name || customer.username || authUser.name || authUser.email?.split('@')[0] || 'User',
        email: customer.email || authUser.email,
        phone: customer.phone || authUser.phone || '',
        id: authUser.id,
      });
      return { isAdmin: false as const };
    }

    const fallbackName = authUser.name || authUser.email?.split('@')[0] || 'User';
    const syncedCustomer = await ensureCustomerProfile(authUser, fallbackName);
    if (syncedCustomer) {
      setUser({
        name: syncedCustomer.full_name || syncedCustomer.username || fallbackName,
        email: syncedCustomer.email || authUser.email,
        phone: syncedCustomer.phone || authUser.phone || '',
        id: authUser.id,
      });
    } else {
      setUser({
        name: fallbackName,
        email: authUser.email,
        phone: authUser.phone || '',
        id: authUser.id,
      });
    }

    return { isAdmin: false as const };
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('[Auth] checking current session');
        const { data, error } = await insforge.auth.getCurrentUser();
        console.log('[Auth] getCurrentUser response', { data, error });
        const authUser = (data as any)?.user ?? data ?? null;

        if (!authUser?.id || error) {
          setUser(null);
          setIsAdmin(false);
          setUserId(null);
          return;
        }

        await hydrateAuthenticatedUser(authUser);
      } catch (sessionError) {
        console.error('Session check error:', sessionError);
      } finally {
        setAuthReady(true);
      }
    };

    checkSession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('[Auth] login attempt', { username });

      const normalizedEmail = username.trim().toLowerCase();

      const { data, error } = await insforge.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      console.log('[Auth] signInWithPassword response', { data, error });

      if (error) {
        console.error('[Auth] signInWithPassword error:', error);
        throw new Error('Invalid email or password. Please check your credentials or sign up for a new account.');
      }

      const authUser = (data as any)?.user ?? (data as any)?.session?.user ?? null;
      if (!authUser?.id) {
        console.error('[Auth] No user ID in login response');
        throw new Error('Invalid email or password. Please check your credentials or sign up for a new account.');
      }

      const authenticated = await hydrateAuthenticatedUser(authUser);
      router.push(authenticated.isAdmin ? '/admin' : '/');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const adminLogin = async (username: string, password: string) => {
    const normalizedIdentifier = username.trim().toLowerCase();
    const adminEmail = normalizedIdentifier === 'thepinkieswear'
      ? 'snehakushi31@gmail.com'
      : normalizedIdentifier;

    if (!isAllowedAdminEmail(adminEmail)) {
      return false;
    }

    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email: adminEmail,
        password,
      });

      if (error || !data) {
        console.log('[Auth] admin login failed', error);
        return false;
      }

      const authUser = (data as any)?.user ?? (data as any)?.session?.user ?? null;
      if (!authUser?.id) {
        return false;
      }

      const authenticated = await hydrateAuthenticatedUser(authUser);
      if (!authenticated.isAdmin) {
        await insforge.auth.signOut();
        setUser(null);
        setUserId(null);
        setIsAdmin(false);
        return false;
      }

      router.push('/admin');
      return true;
    } catch (err) {
      console.error('[Auth] admin login error:', err);
      return false;
    }
  };

  const signup = async (email: string, username: string, phone: string, password: string) => {
    try {
      console.log('[Auth] signup attempt', { email, username });

      const { data, error } = await insforge.auth.signUp({
        email,
        password,
        name: username,
      });

      console.log('[Auth] signUp response', { data, error });

      const authUser = (data as any)?.user ?? (data as any)?.session?.user ?? null;
      const errorPayload = error as any;
      let message = errorPayload?.message || errorPayload?.error?.message || errorPayload?.details?.message || 'Signup failed. Please try again.';

      if (error) {
        if (message.includes('already') || message.includes('exists') || message.includes('duplicate') || message.includes('registered')) {
          throw new Error('This email is already registered. Please login instead.');
        }
        if (message.includes('password')) {
          throw new Error('Please choose a stronger password.');
        }
        if (message.includes('username')) {
          throw new Error('Username already taken. Please choose another.');
        }
        throw new Error(message);
      }

      // If signup succeeded without immediate session, try to get user ID and create profile
      if (!authUser?.id) {
        const userId = (data as any)?.id;
        if (userId) {
          console.log('[Auth] Creating customer profile without immediate session');
          const { error: customerError } = await insforge.database
            .from('customers')
            .upsert([{
              auth_id: userId,
              full_name: username,
              username,
              phone,
              whatsapp: phone,
              email,
            }], { onConflict: 'auth_id' })
            .select('id')
            .limit(1);

          if (customerError) {
            console.error('[Auth] Customer profile creation error:', customerError);
          }
        }
        console.log('[Auth] Signup succeeded without immediate session; redirecting to login.');
        router.push('/login');
        return true;
      }

      // Create customer profile with immediate session
      const { error: customerError } = await insforge.database
        .from('customers')
        .upsert([{
          auth_id: authUser.id,
          full_name: username,
          username,
          phone,
          whatsapp: phone,
          email,
        }], { onConflict: 'auth_id' })
        .select('id')
        .limit(1);

      if (customerError) {
        const errorMessage = customerError.message || JSON.stringify(customerError) || 'Unknown error';
        if (errorMessage.includes('duplicate key') || errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
          if (errorMessage.includes('username') || errorMessage.includes('customers_username_key')) {
            throw new Error('Username already taken. Please choose another.');
          }
          if (errorMessage.includes('email') || errorMessage.includes('customers_email_key')) {
            throw new Error('Email already registered. Please login instead.');
          }
          throw new Error('This account already exists. Please login instead.');
        }

        if (errorMessage.includes('null') || errorMessage.includes('not null')) {
          throw new Error('Missing required information. Please fill all fields correctly.');
        }

        throw new Error(`Failed to create account: ${errorMessage}`);
      }

      setUserId(authUser.id);

      if (isAllowedAdminEmail(email)) {
        const adminData = await getAdminProfile(authUser.id);

        if (adminData) {
          setIsAdmin(true);
          setUser({
            name: adminData.username || username,
            email: adminData.email || email,
            phone,
            id: authUser.id,
          });
          router.push('/admin');
          return true;
        }
      }

      setIsAdmin(false);
      setUser({ name: username, email, phone, id: authUser.id });
      router.push('/');
      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      console.log('[Auth] sendPasswordResetEmail attempt', { email });
      const { data, error } = await insforge.auth.sendResetPasswordEmail({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      console.log('[Auth] sendResetPasswordEmail response', { data, error });
      if (error) throw error;
    } catch (error: any) {
      console.error('Password reset request error:', error);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      console.log('[Auth] resetPassword attempt');
      const { data, error } = await insforge.auth.resetPassword({
        otp: token,
        newPassword,
      });
      console.log('[Auth] resetPassword response', { data, error });
      if (error) throw error;
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('[Auth] logout attempt');
    await insforge.auth.signOut();
    console.log('[Auth] logout response');
    setUser(null);
    setIsAdmin(false);
    setUserId(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, authReady, userId, login, adminLogin, signup, logout, sendPasswordResetEmail, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
