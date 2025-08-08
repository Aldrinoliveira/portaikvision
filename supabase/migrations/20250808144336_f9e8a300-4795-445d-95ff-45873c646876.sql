-- Enable necessary extensions
create extension if not exists pgcrypto;

-- 1) Roles enum and user_roles table
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Function to check roles (SECURITY DEFINER to avoid recursive RLS)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- RLS policies for user_roles
create policy "Users can view own roles or admins view all"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Only admins can insert roles"
  on public.user_roles for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can update roles"
  on public.user_roles for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can delete roles"
  on public.user_roles for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- 2) Core domain tables
create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  created_at timestamptz not null default now()
);

alter table public.categorias enable row level security;

create table public.subcategorias (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references public.categorias(id) on delete cascade,
  nome text not null,
  descricao text,
  created_at timestamptz not null default now()
);

alter table public.subcategorias enable row level security;

create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  partnumber text not null,
  descricao text,
  imagem_url text,
  categoria_id uuid not null references public.categorias(id) on delete restrict,
  subcategoria_id uuid references public.subcategorias(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.produtos enable row level security;

create table public.numeros_serie (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  numero_serie text not null,
  created_at timestamptz not null default now(),
  unique (numero_serie)
);

alter table public.numeros_serie enable row level security;

create table public.arquivos (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  categoria_arquivo text not null check (categoria_arquivo in ('firmware','documento','video')),
  nome_arquivo text not null,
  link_url text not null,
  downloads int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.arquivos enable row level security;

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  imagem_url text not null,
  tamanho text,
  link_redirecionamento text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.banners enable row level security;

create table public.solicitacoes_firmware (
  id uuid primary key default gen_random_uuid(),
  numero_serie text,
  produto_nome text,
  descricao text,
  status text not null default 'pendente',
  created_at timestamptz not null default now()
);

alter table public.solicitacoes_firmware enable row level security;

-- 3) Indexes for search/perf
create index idx_produtos_partnumber on public.produtos(partnumber);
create index idx_numeros_serie_numero on public.numeros_serie(numero_serie);
create index idx_arquivos_produto on public.arquivos(produto_id);
create index idx_subcategorias_categoria on public.subcategorias(categoria_id);

-- 4) RLS Policies
-- Public readable content (anon + authenticated)
create policy "Categorias are viewable by everyone"
  on public.categorias for select to anon, authenticated using (true);
create policy "Subcategorias are viewable by everyone"
  on public.subcategorias for select to anon, authenticated using (true);
create policy "Produtos are viewable by everyone"
  on public.produtos for select to anon, authenticated using (true);
create policy "Numeros de serie are viewable by everyone"
  on public.numeros_serie for select to anon, authenticated using (true);
create policy "Arquivos are viewable by everyone"
  on public.arquivos for select to anon, authenticated using (true);
create policy "Banners are viewable by everyone"
  on public.banners for select to anon, authenticated using (true);

-- Admin-only write access
create policy "Only admins can insert categorias"
  on public.categorias for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "Only admins can update categorias"
  on public.categorias for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Only admins can delete categorias"
  on public.categorias for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "Only admins can insert subcategorias"
  on public.subcategorias for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "Only admins can update subcategorias"
  on public.subcategorias for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Only admins can delete subcategorias"
  on public.subcategorias for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "Only admins can insert produtos"
  on public.produtos for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "Only admins can update produtos"
  on public.produtos for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Only admins can delete produtos"
  on public.produtos for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "Only admins can insert numeros_serie"
  on public.numeros_serie for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "Only admins can update numeros_serie"
  on public.numeros_serie for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Only admins can delete numeros_serie"
  on public.numeros_serie for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "Only admins can insert arquivos"
  on public.arquivos for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "Only admins can update arquivos"
  on public.arquivos for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Only admins can delete arquivos"
  on public.arquivos for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "Only admins can insert banners"
  on public.banners for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "Only admins can update banners"
  on public.banners for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Only admins can delete banners"
  on public.banners for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- Solicitações: anyone can create, only admins can view/manage
create policy "Anyone can create solicitacoes"
  on public.solicitacoes_firmware for insert to anon, authenticated with check (true);
create policy "Admins can view solicitacoes"
  on public.solicitacoes_firmware for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins can update solicitacoes"
  on public.solicitacoes_firmware for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins can delete solicitacoes"
  on public.solicitacoes_firmware for delete to authenticated using (public.has_role(auth.uid(),'admin'));
