-- Add username column to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for username
CREATE INDEX IF NOT EXISTS idx_customers_username ON public.customers(username);

-- Update existing customers to have username based on email
UPDATE public.customers 
SET username = SUBSTRING(email FROM POSITION('@' IN email) + 1) 
WHERE username IS NULL AND email IS NOT NULL;
