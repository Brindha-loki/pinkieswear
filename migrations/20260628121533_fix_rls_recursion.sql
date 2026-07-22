-- Fix infinite recursion in RLS policies by using SECURITY DEFINER helper function

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Customers can view all customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all order images" ON public.order_images;
DROP POLICY IF EXISTS "Admins can insert all order images" ON public.order_images;
DROP POLICY IF EXISTS "Admins can view all gallery products" ON public.gallery_products;
DROP POLICY IF EXISTS "Admins can insert gallery products" ON public.gallery_products;
DROP POLICY IF EXISTS "Admins can update gallery products" ON public.gallery_products;
DROP POLICY IF EXISTS "Admins can delete gallery products" ON public.gallery_products;
DROP POLICY IF EXISTS "Admins can insert nail sizes" ON public.nail_sizes;
DROP POLICY IF EXISTS "Admins can update nail sizes" ON public.nail_sizes;
DROP POLICY IF EXISTS "Admins can delete nail sizes" ON public.nail_sizes;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can update admin users" ON public.admin_users;

-- Create helper function to check if user is admin (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE auth_id = auth.uid()
  );
END;
$$;

-- Create helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE auth_id = auth.uid() AND role = 'super_admin'
  );
END;
$$;

-- Recreate policies using helper functions
CREATE POLICY "Customers can view all customers" ON public.customers
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all orders" ON public.orders
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can view all order images" ON public.order_images
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert all order images" ON public.order_images
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can view all gallery products" ON public.gallery_products
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert gallery products" ON public.gallery_products
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update gallery products" ON public.gallery_products
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete gallery products" ON public.gallery_products
  FOR DELETE USING (public.is_admin());

CREATE POLICY "Admins can insert nail sizes" ON public.nail_sizes
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update nail sizes" ON public.nail_sizes
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete nail sizes" ON public.nail_sizes
  FOR DELETE USING (public.is_admin());

CREATE POLICY "Admins can view admin users" ON public.admin_users
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Super admins can insert admin users" ON public.admin_users
  FOR INSERT WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins can update admin users" ON public.admin_users
  FOR UPDATE USING (public.is_super_admin());
