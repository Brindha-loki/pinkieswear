-- Create nail_sizes table
CREATE TABLE IF NOT EXISTS public.nail_sizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(auth_id)
);

-- Create gallery_products table
CREATE TABLE IF NOT EXISTS public.gallery_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  gallery_product_id UUID REFERENCES public.gallery_products(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT NOT NULL,
  design_notes TEXT,
  nail_shape_id UUID REFERENCES public.nail_sizes(id) ON DELETE SET NULL,
  sizing_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_images table
CREATE TABLE IF NOT EXISTS public.order_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL CHECK (image_type IN ('inspiration', 'nail_photo')),
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(auth_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_auth_id ON public.customers(auth_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_gallery_product_id ON public.orders(gallery_product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_images_order_id ON public.order_images(order_id);
CREATE INDEX IF NOT EXISTS idx_gallery_products_is_active ON public.gallery_products(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_products_category ON public.gallery_products(category);
CREATE INDEX IF NOT EXISTS idx_admin_users_auth_id ON public.admin_users(auth_id);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nail_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Customers can view their own data" ON public.customers
  FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY "Customers can insert their own data" ON public.customers
  FOR INSERT WITH CHECK (auth_id = auth.uid());

CREATE POLICY "Customers can update their own data" ON public.customers
  FOR UPDATE USING (auth_id = auth.uid());

CREATE POLICY "Admins can view all customers" ON public.customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

-- RLS Policies for orders
CREATE POLICY "Customers can view their own orders" ON public.orders
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Customers can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (
    customer_id IN (
      SELECT id FROM public.customers WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update their own orders" ON public.orders
  FOR UPDATE USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update all orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

-- RLS Policies for order_images
CREATE POLICY "Customers can view their own order images" ON public.order_images
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE customer_id IN (
        SELECT id FROM public.customers WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Customers can insert their own order images" ON public.order_images
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders
      WHERE customer_id IN (
        SELECT id FROM public.customers WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can view all order images" ON public.order_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert all order images" ON public.order_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

-- RLS Policies for gallery_products
CREATE POLICY "Everyone can view active gallery products" ON public.gallery_products
  FOR SELECT USING (is_active = true);

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

-- RLS Policies for nail_sizes
CREATE POLICY "Everyone can view nail sizes" ON public.nail_sizes
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert nail sizes" ON public.nail_sizes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update nail sizes" ON public.nail_sizes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete nail sizes" ON public.nail_sizes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

-- RLS Policies for admin_users
CREATE POLICY "Admins can view admin users" ON public.admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can insert admin users" ON public.admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update admin users" ON public.admin_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Insert default nail sizes
INSERT INTO public.nail_sizes (name, description) VALUES
  ('Short Oval', 'A classic oval shape with shorter length'),
  ('Long Oval', 'Elegant oval shape with extended length'),
  ('Short Square', 'Square shape with flat tip, shorter length'),
  ('Medium Square', 'Square shape with flat tip, medium length'),
  ('Long Square', 'Square shape with flat tip, longer length'),
  ('Short Coffin', 'Tapered shape with flat tip, shorter length'),
  ('Medium Coffin', 'Tapered shape with flat tip, medium length'),
  ('Long Coffin', 'Tapered shape with flat tip, longer length'),
  ('XL Coffin', 'Extra long tapered shape with flat tip'),
  ('Short Almond', 'Pointed oval shape, shorter length'),
  ('Medium Almond', 'Pointed oval shape, medium length'),
  ('Long Almond', 'Pointed oval shape, longer length'),
  ('Long Stiletto', 'Sharp pointed shape, longer length'),
  ('XL Stiletto', 'Extra long sharp pointed shape')
ON CONFLICT (name) DO NOTHING;
