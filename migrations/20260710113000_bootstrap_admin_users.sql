-- Bootstrap approved admin accounts through a SECURITY DEFINER function instead of client-side inserts.

CREATE OR REPLACE FUNCTION public.bootstrap_admin_user()
RETURNS TABLE (
  id UUID,
  auth_id UUID,
  role TEXT,
  email TEXT,
  username TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_auth_id UUID := auth.uid();
  current_email TEXT;
  resolved_username TEXT;
BEGIN
  IF current_auth_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT u.email
  INTO current_email
  FROM auth.users AS u
  WHERE u.id = current_auth_id;

  IF current_email IS NULL THEN
    RAISE EXCEPTION 'Authenticated user not found';
  END IF;

  IF lower(current_email) <> 'snehakushi31@gmail.com' THEN
    RAISE EXCEPTION 'User is not eligible for admin access';
  END IF;

  UPDATE auth.users
  SET email_verified = true,
      updated_at = NOW()
  WHERE id = current_auth_id
    AND email_verified IS DISTINCT FROM true;

  resolved_username := split_part(current_email, '@', 1);

  INSERT INTO public.admin_users (auth_id, role, email, username)
  VALUES (current_auth_id, 'admin', current_email, resolved_username)
  ON CONFLICT (auth_id) DO UPDATE
  SET role = EXCLUDED.role,
      email = EXCLUDED.email,
      username = COALESCE(public.admin_users.username, EXCLUDED.username),
      updated_at = NOW();

  RETURN QUERY
  SELECT au.id, au.auth_id, au.role, au.email, au.username
  FROM public.admin_users AS au
  WHERE au.auth_id = current_auth_id
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_admin_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_admin_user() TO authenticated;

UPDATE auth.users
SET email_verified = true,
    updated_at = NOW()
WHERE lower(email) = 'snehakushi31@gmail.com'
  AND email_verified IS DISTINCT FROM true;

INSERT INTO public.admin_users (auth_id, role, email, username)
SELECT u.id, 'admin', u.email, split_part(u.email, '@', 1)
FROM auth.users AS u
WHERE lower(u.email) = 'snehakushi31@gmail.com'
ON CONFLICT (auth_id) DO UPDATE
SET role = EXCLUDED.role,
    email = EXCLUDED.email,
    username = COALESCE(public.admin_users.username, EXCLUDED.username),
    updated_at = NOW();