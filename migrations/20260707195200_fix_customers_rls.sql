-- Fix RLS policies for customers table to allow users to insert their own records

-- Drop existing customers RLS policy
DROP POLICY IF EXISTS "Customers can view all customers" ON public.customers;

-- Create policies that allow users to manage their own customer records
CREATE POLICY "Users can insert their own customer record" ON public.customers
  FOR INSERT WITH CHECK (auth_id = auth.uid());

CREATE POLICY "Users can view their own customer record" ON public.customers
  FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY "Users can update their own customer record" ON public.customers
  FOR UPDATE USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "Admins can view all customers" ON public.customers
  FOR SELECT USING (public.is_admin());
