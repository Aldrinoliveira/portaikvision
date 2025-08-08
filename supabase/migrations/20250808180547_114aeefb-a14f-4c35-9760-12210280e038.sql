-- Add column to control public listing of files
ALTER TABLE public.arquivos
ADD COLUMN IF NOT EXISTS listado boolean NOT NULL DEFAULT true;

-- Adjust RLS: Replace permissive public SELECT with conditional policies
DROP POLICY IF EXISTS "Arquivos are viewable by everyone" ON public.arquivos;

-- Public can view only listed files
CREATE POLICY "Arquivos listados são visíveis publicamente"
ON public.arquivos
FOR SELECT
USING (listado = true);

-- Admins can view all files (listed or not)
CREATE POLICY "Admins podem ver todos os arquivos"
ON public.arquivos
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
