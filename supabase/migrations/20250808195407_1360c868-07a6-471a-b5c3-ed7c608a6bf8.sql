-- Create site_settings table to store global UI settings for the site
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Colors can be any valid CSS color value (e.g., hsl(...), #hex, rgb(...), var(--token))
  banner_title_color text,
  banner_desc_color text,
  -- Sizes can be any valid CSS length (e.g., 1rem, 18px, clamp(...))
  banner_title_size text,
  banner_desc_size text
);

-- Enable RLS
alter table public.site_settings enable row level security;

-- Create helper function to update updated_at on row updates (if not exists)
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach trigger
create or replace trigger trg_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.update_updated_at_column();

-- Policies
-- Everyone can read the settings
create policy if not exists "Site settings are readable by everyone"
  on public.site_settings for select
  using (true);

-- Only admins can insert
create policy if not exists "Only admins can insert site settings"
  on public.site_settings for insert
  with check (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update
create policy if not exists "Only admins can update site settings"
  on public.site_settings for update
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete
create policy if not exists "Only admins can delete site settings"
  on public.site_settings for delete
  using (has_role(auth.uid(), 'admin'::app_role));
