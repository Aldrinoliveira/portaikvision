-- Create public storage bucket for banners if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'banners') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);
  END IF;
END $$;

-- Policies for public read and admin write on banners bucket
-- Public can read banners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can read banners'
  ) THEN
    CREATE POLICY "Public can read banners"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'banners');
  END IF;
END $$;

-- Admins can upload to banners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload banners'
  ) THEN
    CREATE POLICY "Admins can upload banners"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- Admins can update banners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can update banners'
  ) THEN
    CREATE POLICY "Admins can update banners"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'::public.app_role))
    WITH CHECK (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- Admins can delete banners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete banners'
  ) THEN
    CREATE POLICY "Admins can delete banners"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;