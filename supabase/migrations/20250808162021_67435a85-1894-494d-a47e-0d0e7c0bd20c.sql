-- Bootstrap: grant admin to most recently created user if no admins exist yet
DO $$
DECLARE
  u uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    SELECT id INTO u FROM auth.users ORDER BY created_at DESC LIMIT 1;
    IF u IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (u, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
  END IF;
END $$;