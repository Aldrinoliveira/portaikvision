-- Increment downloads via RPC (security definer)
create or replace function public.increment_downloads(_arquivo_id uuid)
returns table(link_url text, downloads int)
language sql
security definer
set search_path = public
as $$
  update public.arquivos
  set downloads = downloads + 1
  where id = _arquivo_id
  returning link_url, downloads;
$$;

-- Allow web roles to execute
grant execute on function public.increment_downloads(uuid) to anon, authenticated;

-- View for top downloads per produto
create or replace view public.vw_top_downloads as
select produto_id, sum(downloads)::bigint as total_downloads
from public.arquivos
group by produto_id;
