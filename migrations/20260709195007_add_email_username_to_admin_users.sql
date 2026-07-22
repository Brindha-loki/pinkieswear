-- Add email and username columns to admin_users table
ALTER TABLE admin_users
ADD COLUMN email TEXT UNIQUE,
ADD COLUMN username TEXT UNIQUE;

-- Create index for email lookups
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_username ON admin_users(username);
