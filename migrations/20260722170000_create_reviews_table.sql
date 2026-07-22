-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON public.reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Everyone can view approved reviews" ON public.reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Customers can insert their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    customer_id IN (
      SELECT id FROM public.customers WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view their own reviews" ON public.reviews
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all reviews" ON public.reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update all reviews" ON public.reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete all reviews" ON public.reviews
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT ALL ON TABLE public.reviews TO authenticated;
GRANT SELECT ON TABLE public.reviews TO anon;
