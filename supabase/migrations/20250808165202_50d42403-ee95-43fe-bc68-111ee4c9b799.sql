-- Promote current user to admin (based on observed active session id)
INSERT INTO public.user_roles (user_id, role)
VALUES ('df52863e-10b8-4b94-8d1d-1feedb027c11', 'admin'::public.app_role)
ON CONFLICT (user_id, role) DO NOTHING;