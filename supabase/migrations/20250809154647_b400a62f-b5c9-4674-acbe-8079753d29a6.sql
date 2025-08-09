-- Add contact fields to solicitacoes_firmware
ALTER TABLE public.solicitacoes_firmware
  ADD COLUMN IF NOT EXISTS nome text,
  ADD COLUMN IF NOT EXISTS telefone text,
  ADD COLUMN IF NOT EXISTS email text;

-- Optional: simple index to speed up filtering by status (not required but helpful)
CREATE INDEX IF NOT EXISTS idx_solicitacoes_firmware_status ON public.solicitacoes_firmware (status);
