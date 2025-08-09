-- Fix increment_downloads ambiguity by qualifying columns and aliasing return
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
  UPDATE public.arquivos AS a
  SET downloads = a.downloads + 1
  WHERE a.id = _arquivo_id
  RETURNING a.link_url, a.downloads, a.produto_id
  INTO v_link, v_downloads, v_produto;

  INSERT INTO public.download_logs (arquivo_id, produto_id)
  VALUES (_arquivo_id, v_produto);

  RETURN QUERY SELECT v_link AS link_url, v_downloads AS downloads;
END;
$$;