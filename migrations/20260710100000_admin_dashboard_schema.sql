-- Add rejection and tracking fields to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected'));
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES public.admin_users(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update payment_details table with more comprehensive payment info
ALTER TABLE public.payment_details ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE public.payment_details ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE public.payment_details ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'unknown' CHECK (payment_method IN ('razorpay', 'upi', 'unknown'));
ALTER TABLE public.payment_details ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE public.payment_details ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));
ALTER TABLE public.payment_details ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2);
ALTER TABLE public.payment_details ADD COLUMN IF NOT EXISTS gateway_response JSONB;
ALTER TABLE public.payment_details ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_rejected_at ON public.orders(rejected_at);
CREATE INDEX IF NOT EXISTS idx_payment_details_status ON public.payment_details(status);
CREATE INDEX IF NOT EXISTS idx_payment_details_payment_method ON public.payment_details(payment_method);

-- Update RLS policies for order_status
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
CREATE POLICY "Customers can view their own orders" ON public.orders
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE auth_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Customers can insert their own orders" ON public.orders;
CREATE POLICY "Customers can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (
    customer_id IN (
      SELECT id FROM public.customers WHERE auth_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Customers can update their own orders" ON public.orders;
CREATE POLICY "Customers can update their own orders" ON public.orders
  FOR UPDATE USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE auth_id = auth.uid()
    )
  );

-- Add admin policies for orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

-- RLS Policies for gallery_products to allow admin editing
DROP POLICY IF EXISTS "Everyone can view active gallery products" ON public.gallery_products;
CREATE POLICY "Everyone can view active gallery products" ON public.gallery_products
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can view all gallery products" ON public.gallery_products;
CREATE POLICY "Admins can view all gallery products" ON public.gallery_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert gallery products" ON public.gallery_products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update gallery products" ON public.gallery_products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete gallery products" ON public.gallery_products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );
