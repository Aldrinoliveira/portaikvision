
-- Limpar completamente o storage e reconstruir
-- ATENÇÃO: Esta operação remove TODOS os arquivos existentes

-- 1. Remover todas as políticas existentes
DELETE FROM storage.policies WHERE bucket_id IN ('produtos', 'banners', 'arquivos', 'teste');

-- 2. Remover todos os objetos dos buckets
DELETE FROM storage.objects WHERE bucket_id IN ('produtos', 'banners', 'arquivos', 'teste');

-- 3. Remover os buckets existentes
DELETE FROM storage.buckets WHERE id IN ('produtos', 'banners', 'arquivos', 'teste');

-- 4. Recriar os buckets com configurações corretas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, avif_autodetection, created_at, updated_at)
VALUES 
  ('produtos', 'produtos', true, 52428800, '{"image/jpeg","image/jpg","image/png","image/gif","image/webp","image/svg+xml"}', false, now(), now()),
  ('banners', 'banners', true, 52428800, '{"image/jpeg","image/jpg","image/png","image/gif","image/webp","image/svg+xml"}', false, now(), now()),
  ('arquivos', 'arquivos', true, 104857600, null, false, now(), now()),
  ('teste', 'teste', false, 52428800, null, false, now(), now());

-- 5. Criar políticas RLS simplificadas e funcionais
-- Bucket produtos
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'produtos', 'Public read access for produtos', 'true', null, 'SELECT', now(), now()),
  (gen_random_uuid(), 'produtos', 'Admin upload access for produtos', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', 'INSERT', now(), now()),
  (gen_random_uuid(), 'produtos', 'Admin update access for produtos', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', 'UPDATE', now(), now()),
  (gen_random_uuid(), 'produtos', 'Admin delete access for produtos', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', null, 'DELETE', now(), now());

-- Bucket banners
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'banners', 'Public read access for banners', 'true', null, 'SELECT', now(), now()),
  (gen_random_uuid(), 'banners', 'Admin upload access for banners', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', 'INSERT', now(), now()),
  (gen_random_uuid(), 'banners', 'Admin update access for banners', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', 'UPDATE', now(), now()),
  (gen_random_uuid(), 'banners', 'Admin delete access for banners', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', null, 'DELETE', now(), now());

-- Bucket arquivos
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'arquivos', 'Public read access for arquivos', 'true', null, 'SELECT', now(), now()),
  (gen_random_uuid(), 'arquivos', 'Admin upload access for arquivos', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', 'INSERT', now(), now()),
  (gen_random_uuid(), 'arquivos', 'Admin update access for arquivos', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', 'UPDATE', now(), now()),
  (gen_random_uuid(), 'arquivos', 'Admin delete access for arquivos', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', null, 'DELETE', now(), now());

-- Bucket teste (privado)
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'teste', 'Admin read access for teste', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', null, 'SELECT', now(), now()),
  (gen_random_uuid(), 'teste', 'Admin upload access for teste', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', 'INSERT', now(), now()),
  (gen_random_uuid(), 'teste', 'Admin update access for teste', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', 'UPDATE', now(), now()),
  (gen_random_uuid(), 'teste', 'Admin delete access for teste', 'auth.role() = ''authenticated'' AND has_role(auth.uid(), ''admin''::app_role)', null, 'DELETE', now(), now());

-- 6. Verificar se tudo foi criado corretamente
SELECT 
  b.id,
  b.name,
  b.public,
  b.file_size_limit,
  b.allowed_mime_types,
  COUNT(p.id) as policy_count
FROM storage.buckets b
LEFT JOIN storage.policies p ON b.id = p.bucket_id
WHERE b.id IN ('produtos', 'banners', 'arquivos', 'teste')
GROUP BY b.id, b.name, b.public, b.file_size_limit, b.allowed_mime_types
ORDER BY b.name;
