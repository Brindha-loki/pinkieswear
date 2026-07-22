-- Add username to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Update orders table with enhanced fields
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'refund_pending', 'refund_completed', 'rejected'));
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Create order_number function for auto-generation
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_num TEXT;
  prefix TEXT := 'TPS';
  seq_num INTEGER;
BEGIN
  -- Get the next sequence number
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number, 4) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.orders;
  
  -- Format: TPS-000001
  order_num := prefix || '-' || LPAD(seq_num::TEXT, 6, '0');
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Update orders table to auto-generate order_number
ALTER TABLE public.orders ALTER COLUMN order_number SET DEFAULT generate_order_number();

-- Create payment_details table for manual payment tracking
CREATE TABLE IF NOT EXISTS public.payment_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_screenshot_url TEXT,
  sender_name TEXT,
  sender_upi_id TEXT,
  upi_transaction_id TEXT,
  amount_paid DECIMAL(10, 2),
  payment_date TIMESTAMP WITH TIME ZONE,
  refund_status TEXT DEFAULT 'none' CHECK (refund_status IN ('none', 'processing', 'completed')),
  refund_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_details_order_id ON public.payment_details(order_id);

-- Enable RLS on payment_details
ALTER TABLE public.payment_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_details
CREATE POLICY "Customers can view their own payment details" ON public.payment_details
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE customer_id IN (
        SELECT id FROM public.customers WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Customers can insert their own payment details" ON public.payment_details
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders
      WHERE customer_id IN (
        SELECT id FROM public.customers WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can view all payment details" ON public.payment_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert all payment details" ON public.payment_details
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update all payment details" ON public.payment_details
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Update existing orders to have order numbers
UPDATE public.orders SET order_number = generate_order_number() WHERE order_number IS NULL;

-- Seed admin user with specified credentials
-- Note: In production, this should be done securely
-- For now, we'll use the adminLogin function in AuthContext for demo purposes
