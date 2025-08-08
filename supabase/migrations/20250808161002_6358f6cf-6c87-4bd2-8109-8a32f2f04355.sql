-- Create public storage bucket for produtos if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'produtos') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('produtos', 'produtos', true);
  END IF;
END $$;

-- Policies for public read and admin write on produtos bucket
-- Public can read produtos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can read produtos'
  ) THEN
    CREATE POLICY "Public can read produtos"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'produtos');
  END IF;
END $$;

-- Admins can upload to produtos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload produtos'
  ) THEN
    CREATE POLICY "Admins can upload produtos"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'produtos' AND public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- Admins can update produtos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can update produtos'
  ) THEN
    CREATE POLICY "Admins can update produtos"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'produtos' AND public.has_role(auth.uid(), 'admin'::public.app_role))
    WITH CHECK (bucket_id = 'produtos' AND public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- Admins can delete produtos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete produtos'
  ) THEN
    CREATE POLICY "Admins can delete produtos"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'produtos' AND public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;