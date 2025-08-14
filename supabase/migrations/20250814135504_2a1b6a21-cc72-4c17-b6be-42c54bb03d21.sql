
-- Verificar se os buckets existem e estão configurados corretamente
SELECT 
  id, 
  name, 
  public,
  created_at,
  updated_at
FROM storage.buckets 
ORDER BY name;

-- Se os buckets não existirem ou estiverem com problemas, vamos recriá-los
-- Primeiro, limpar buckets existentes se necessário (cuidado: isso remove todos os arquivos)
DELETE FROM storage.objects WHERE bucket_id IN ('produtos', 'banners', 'arquivos', 'teste');
DELETE FROM storage.buckets WHERE id IN ('produtos', 'banners', 'arquivos', 'teste');

-- Recriar os buckets necessários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('produtos', 'produtos', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('banners', 'banners', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('arquivos', 'arquivos', true, 104857600, NULL),
  ('teste', 'teste', false, 52428800, NULL);

-- Criar políticas RLS para os buckets
-- Política para produtos (leitura pública, escrita apenas admin)
INSERT INTO storage.policies (bucket_id, name, definition, check_definition, command)
VALUES 
  ('produtos', 'Produtos públicos para leitura', 'true', NULL, 'SELECT'),
  ('produtos', 'Apenas admins podem fazer upload em produtos', 'has_role(auth.uid(), ''admin''::app_role)', 'has_role(auth.uid(), ''admin''::app_role)', 'INSERT'),
  ('produtos', 'Apenas admins podem atualizar produtos', 'has_role(auth.uid(), ''admin''::app_role)', 'has_role(auth.uid(), ''admin''::app_role)', 'UPDATE'),
  ('produtos', 'Apenas admins podem deletar produtos', 'has_role(auth.uid(), ''admin''::app_role)', NULL, 'DELETE');

-- Política para banners (leitura pública, escrita apenas admin)
INSERT INTO storage.policies (bucket_id, name, definition, check_definition, command)
VALUES 
  ('banners', 'Banners públicos para leitura', 'true', NULL, 'SELECT'),
  ('banners', 'Apenas admins podem fazer upload em banners', 'has_role(auth.uid(), ''admin''::app_role)', 'has_role(auth.uid(), ''admin''::app_role)', 'INSERT'),
  ('banners', 'Apenas admins podem atualizar banners', 'has_role(auth.uid(), ''admin''::app_role)', 'has_role(auth.uid(), ''admin''::app_role)', 'UPDATE'),
  ('banners', 'Apenas admins podem deletar banners', 'has_role(auth.uid(), ''admin''::app_role)', NULL, 'DELETE');

-- Política para arquivos (leitura pública, escrita apenas admin)
INSERT INTO storage.policies (bucket_id, name, definition, check_definition, command)
VALUES 
  ('arquivos', 'Arquivos públicos para leitura', 'true', NULL, 'SELECT'),
  ('arquivos', 'Apenas admins podem fazer upload em arquivos', 'has_role(auth.uid(), ''admin''::app_role)', 'has_role(auth.uid(), ''admin''::app_role)', 'INSERT'),
  ('arquivos', 'Apenas admins podem atualizar arquivos', 'has_role(auth.uid(), ''admin''::app_role)', 'has_role(auth.uid(), ''admin''::app_role)', 'UPDATE'),
  ('arquivos', 'Apenas admins podem deletar arquivos', 'has_role(auth.uid(), ''admin''::app_role)', NULL, 'DELETE');

-- Política para teste (privado, apenas admin)
INSERT INTO storage.policies (bucket_id, name, definition, check_definition, command)
VALUES 
  ('teste', 'Apenas admins podem acessar teste', 'has_role(auth.uid(), ''admin''::app_role)', NULL, 'SELECT'),
  ('teste', 'Apenas admins podem fazer upload em teste', 'has_role(auth.uid(), ''admin''::app_role)', 'has_role(auth.uid(), ''admin''::app_role)', 'INSERT'),
  ('teste', 'Apenas admins podem atualizar teste', 'has_role(auth.uid(), ''admin''::app_role)', 'has_role(auth.uid(), ''admin''::app_role)', 'UPDATE'),
  ('teste', 'Apenas admins podem deletar teste', 'has_role(auth.uid(), ''admin''::app_role)', NULL, 'DELETE');
