-- Create public storage bucket for uploaded files if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'arquivos') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('arquivos', 'arquivos', true);
  END IF;
END $$;

-- Policies for the 'arquivos' bucket on storage.objects
DO $$
BEGIN
  -- Public read access (so end-users can download/view files)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Arquivos publicly readable'
  ) THEN
    CREATE POLICY "Arquivos publicly readable"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'arquivos');
  END IF;

  -- Only admins can INSERT into this bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can insert arquivos'
  ) THEN
    CREATE POLICY "Admins can insert arquivos"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'arquivos' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;

  -- Only admins can UPDATE objects in this bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can update arquivos'
  ) THEN
    CREATE POLICY "Admins can update arquivos"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'arquivos' AND has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (bucket_id = 'arquivos' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;

  -- Only admins can DELETE objects in this bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete arquivos'
  ) THEN
    CREATE POLICY "Admins can delete arquivos"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'arquivos' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;