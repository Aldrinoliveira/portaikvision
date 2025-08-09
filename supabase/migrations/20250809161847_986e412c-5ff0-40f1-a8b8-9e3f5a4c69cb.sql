-- Create a table to log each download event
CREATE TABLE public.download_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  arquivo_id uuid NOT NULL REFERENCES public.arquivos(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- Policies: only admins can view logs
CREATE POLICY "Admins can view download logs"
  ON public.download_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- No public deletes/updates
CREATE POLICY "Only admins can delete download logs"
  ON public.download_logs FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update download logs"
  ON public.download_logs FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Helpful indexes for analytics
CREATE INDEX idx_download_logs_created_at ON public.download_logs (created_at);
CREATE INDEX idx_download_logs_produto_created_at ON public.download_logs (produto_id, created_at);
CREATE INDEX idx_download_logs_arquivo_created_at ON public.download_logs (arquivo_id, created_at);

-- Update increment_downloads function to also insert a log row
CREATE OR REPLACE FUNCTION public.increment_downloads(_arquivo_id uuid)
RETURNS TABLE(link_url text, downloads integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_link text;
  v_downloads integer;
  v_produto uuid;
BEGIN
  UPDATE public.arquivos
  SET downloads = downloads + 1
  WHERE id = _arquivo_id
  RETURNING link_url, downloads, produto_id INTO v_link, v_downloads, v_produto;

  -- Log the download event
  INSERT INTO public.download_logs (arquivo_id, produto_id)
  VALUES (_arquivo_id, v_produto);

  RETURN QUERY SELECT v_link, v_downloads;
END;
$$;