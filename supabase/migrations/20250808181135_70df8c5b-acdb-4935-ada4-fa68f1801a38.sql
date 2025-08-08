-- Add optional description to arquivos
ALTER TABLE public.arquivos
ADD COLUMN IF NOT EXISTS descricao text NULL;