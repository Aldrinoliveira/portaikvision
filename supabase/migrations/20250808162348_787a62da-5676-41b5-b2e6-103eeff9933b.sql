-- Seed: categorias, subcategorias, produtos e banners de exemplo (idempotente)

-- 1) Categorias
DO $$
DECLARE cid_cameras uuid; cid_alarmes uuid; cid_acessorios uuid; BEGIN
  SELECT id INTO cid_cameras FROM public.categorias WHERE nome = 'Câmeras' LIMIT 1;
  IF cid_cameras IS NULL THEN
    INSERT INTO public.categorias (nome, descricao) VALUES ('Câmeras', 'Câmeras e módulos de captura') RETURNING id INTO cid_cameras;
  END IF;

  SELECT id INTO cid_alarmes FROM public.categorias WHERE nome = 'Alarmes' LIMIT 1;
  IF cid_alarmes IS NULL THEN
    INSERT INTO public.categorias (nome, descricao) VALUES ('Alarmes', 'Soluções de alarme e sensores') RETURNING id INTO cid_alarmes;
  END IF;

  SELECT id INTO cid_acessorios FROM public.categorias WHERE nome = 'Acessórios' LIMIT 1;
  IF cid_acessorios IS NULL THEN
    INSERT INTO public.categorias (nome, descricao) VALUES ('Acessórios', 'Cabos, fontes e suportes') RETURNING id INTO cid_acessorios;
  END IF;
END $$;

-- 2) Subcategorias
DO $$
DECLARE cid_cameras uuid; scid_bullet uuid; scid_dome uuid; BEGIN
  SELECT id INTO cid_cameras FROM public.categorias WHERE nome = 'Câmeras' LIMIT 1;
  IF cid_cameras IS NULL THEN RAISE NOTICE 'Categoria Câmeras não encontrada'; RETURN; END IF;

  SELECT id INTO scid_bullet FROM public.subcategorias WHERE nome = 'Bullet' AND categoria_id = cid_cameras LIMIT 1;
  IF scid_bullet IS NULL THEN
    INSERT INTO public.subcategorias (nome, descricao, categoria_id) VALUES ('Bullet', 'Câmeras bullet', cid_cameras) RETURNING id INTO scid_bullet;
  END IF;

  SELECT id INTO scid_dome FROM public.subcategorias WHERE nome = 'Dome' AND categoria_id = cid_cameras LIMIT 1;
  IF scid_dome IS NULL THEN
    INSERT INTO public.subcategorias (nome, descricao, categoria_id) VALUES ('Dome', 'Câmeras dome', cid_cameras) RETURNING id INTO scid_dome;
  END IF;
END $$;

-- 3) Produtos
DO $$
DECLARE cid_cameras uuid; cid_alarmes uuid; cid_acessorios uuid; scid_bullet uuid; scid_dome uuid; tmp uuid; BEGIN
  SELECT id INTO cid_cameras FROM public.categorias WHERE nome = 'Câmeras' LIMIT 1;
  SELECT id INTO cid_alarmes FROM public.categorias WHERE nome = 'Alarmes' LIMIT 1;
  SELECT id INTO cid_acessorios FROM public.categorias WHERE nome = 'Acessórios' LIMIT 1;
  SELECT id INTO scid_bullet FROM public.subcategorias WHERE nome = 'Bullet' LIMIT 1;
  SELECT id INTO scid_dome FROM public.subcategorias WHERE nome = 'Dome' LIMIT 1;

  -- CAM-100
  IF NOT EXISTS (SELECT 1 FROM public.produtos WHERE partnumber = 'CAM-100') THEN
    INSERT INTO public.produtos (partnumber, descricao, imagem_url, categoria_id, subcategoria_id)
    VALUES ('CAM-100', 'Câmera bullet 1080p com IR', 'https://picsum.photos/seed/cam100/800/500', cid_cameras, scid_bullet)
    RETURNING id INTO tmp;
  END IF;
  -- CAM-200
  IF NOT EXISTS (SELECT 1 FROM public.produtos WHERE partnumber = 'CAM-200') THEN
    INSERT INTO public.produtos (partnumber, descricao, imagem_url, categoria_id, subcategoria_id)
    VALUES ('CAM-200', 'Câmera dome 4MP wide dynamic range', 'https://picsum.photos/seed/cam200/800/500', cid_cameras, scid_dome)
    RETURNING id INTO tmp;
  END IF;
  -- ALM-10
  IF NOT EXISTS (SELECT 1 FROM public.produtos WHERE partnumber = 'ALM-10') THEN
    INSERT INTO public.produtos (partnumber, descricao, imagem_url, categoria_id, subcategoria_id)
    VALUES ('ALM-10', 'Central de alarme com 8 zonas', 'https://picsum.photos/seed/alm10/800/500', cid_alarmes, NULL)
    RETURNING id INTO tmp;
  END IF;
  -- AC-50
  IF NOT EXISTS (SELECT 1 FROM public.produtos WHERE partnumber = 'AC-50') THEN
    INSERT INTO public.produtos (partnumber, descricao, imagem_url, categoria_id, subcategoria_id)
    VALUES ('AC-50', 'Fonte 12V 5A bivolt', 'https://picsum.photos/seed/ac50/800/500', cid_acessorios, NULL)
    RETURNING id INTO tmp;
  END IF;
END $$;

-- 4) Banners
DO $$
DECLARE bcount int; BEGIN
  SELECT count(*) INTO bcount FROM public.banners;
  -- Adiciona dois banners padrões apenas se ainda não existirem (aproximação simples)
  IF NOT EXISTS (SELECT 1 FROM public.banners WHERE imagem_url LIKE '%seed/banner1%') THEN
    INSERT INTO public.banners (imagem_url, tamanho, link_redirecionamento, ativo)
    VALUES ('https://picsum.photos/seed/banner1/1200/400', '1200x400', '/', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.banners WHERE imagem_url LIKE '%seed/banner2%') THEN
    INSERT INTO public.banners (imagem_url, tamanho, link_redirecionamento, ativo)
    VALUES ('https://picsum.photos/seed/banner2/1200/400', '1200x400', '/#produtos', true);
  END IF;
END $$;