-- Create table to store global site settings (idempotent)
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  banner_title_color text,
  banner_desc_color text,
  banner_title_size text,
  banner_desc_size text
);

-- Enable RLS
alter table public.site_settings enable row level security;

-- Timestamp helper function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Recreate trigger safely
drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.update_updated_at_column();

-- Policies (will error if they already exist, which is fine on first creation)
-- Readable by everyone
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'site_settings' and p.policyname = 'Site settings are readable by everyone'
  ) then
    execute 'create policy "Site settings are readable by everyone" on public.site_settings for select using (true)';
  end if;
end $$;

-- Only admins can insert
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'site_settings' and p.policyname = 'Only admins can insert site settings'
  ) then
    execute 'create policy "Only admins can insert site settings" on public.site_settings for insert with check (has_role(auth.uid(), ''admin''::app_role))';
  end if;
end $$;

-- Only admins can update
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'site_settings' and p.policyname = 'Only admins can update site settings'
  ) then
    execute 'create policy "Only admins can update site settings" on public.site_settings for update using (has_role(auth.uid(), ''admin''::app_role)) with check (has_role(auth.uid(), ''admin''::app_role))';
  end if;
end $$;

-- Only admins can delete
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'site_settings' and p.policyname = 'Only admins can delete site settings'
  ) then
    execute 'create policy "Only admins can delete site settings" on public.site_settings for delete using (has_role(auth.uid(), ''admin''::app_role))';
  end if;
end $$;
