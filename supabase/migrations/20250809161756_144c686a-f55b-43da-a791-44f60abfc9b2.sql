-- Create a table to log each download event
create table if not exists public.download_logs (
  id uuid primary key default gen_random_uuid(),
  arquivo_id uuid not null references public.arquivos(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.download_logs enable row level security;

-- Policies: only admins can view logs
create policy if not exists "Admins can view download logs"
  on public.download_logs for select
  using (has_role(auth.uid(), 'admin'::app_role));

-- No public inserts/updates/deletes; inserts will be done by SECURITY DEFINER function
create policy if not exists "Only admins can delete download logs"
  on public.download_logs for delete
  using (has_role(auth.uid(), 'admin'::app_role));

create policy if not exists "Only admins can update download logs"
  on public.download_logs for update
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));

-- Helpful indexes for analytics
create index if not exists idx_download_logs_created_at on public.download_logs (created_at);
create index if not exists idx_download_logs_produto_created_at on public.download_logs (produto_id, created_at);
create index if not exists idx_download_logs_arquivo_created_at on public.download_logs (arquivo_id, created_at);

-- Update increment_downloads function to also insert a log row
create or replace function public.increment_downloads(_arquivo_id uuid)
returns table(link_url text, downloads integer)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_link text;
  v_downloads integer;
  v_produto uuid;
begin
  update public.arquivos
  set downloads = downloads + 1
  where id = _arquivo_id
  returning link_url, downloads, produto_id into v_link, v_downloads, v_produto;

  -- Log the download event
  insert into public.download_logs (arquivo_id, produto_id)
  values (_arquivo_id, v_produto);

  return query select v_link, v_downloads;
end;
$$;