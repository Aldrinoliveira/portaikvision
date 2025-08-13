
-- Atualizar URLs das imagens de produtos do Supabase Cloud para self-hosted
UPDATE produtos 
SET imagem_url = REPLACE(
  imagem_url, 
  'https://vtafquzacrmemncgcjcc.supabase.co/storage/v1/object/public/', 
  'https://dados.portalhikvision.com.br/storage/v1/object/public/'
) 
WHERE imagem_url LIKE 'https://vtafquzacrmemncgcjcc.supabase.co/storage/v1/object/public/%';

-- Atualizar URLs das imagens de banners do Supabase Cloud para self-hosted
UPDATE banners 
SET imagem_url = REPLACE(
  imagem_url, 
  'https://vtafquzacrmemncgcjcc.supabase.co/storage/v1/object/public/', 
  'https://dados.portalhikvision.com.br/storage/v1/object/public/'
) 
WHERE imagem_url LIKE 'https://vtafquzacrmemncgcjcc.supabase.co/storage/v1/object/public/%';
