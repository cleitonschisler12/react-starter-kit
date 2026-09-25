-- Fotos reais de todo o catalogo (reenvio das imagens quebradas + novas) e foto da loja
DELETE FROM public.product_images
WHERE product_id IN (SELECT id FROM public.products WHERE seed_key IN ('P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08', 'P09', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15', 'P16', 'P17', 'P18', 'P19', 'P20', 'P21', 'P22', 'C01', 'C02'));

INSERT INTO public.product_images (product_id, url, alt_text, sort_order, is_primary)
SELECT p.id, v.url, v.alt, 0, true FROM public.products p
JOIN (VALUES
  ('P01', '/images/produto-asad.jpeg', 'Frasco preto e dourado do perfume Asad da Lattafa'),
  ('P02', '/images/produto-asad-elixir.jpeg', 'Frasco preto com detalhes rosé do perfume Asad Elixir da Lattafa'),
  ('P03', '/images/produto-club-de-nuit.jpeg', 'Frasco preto do perfume Club de Nuit Intense Man da Armaf'),
  ('P04', '/images/produto-oud-for-glory.jpeg', 'Frasco preto e dourado do perfume Bade''e Al Oud Oud for Glory da Lattafa'),
  ('P05', '/images/produto-al-noble-wazeer.jpeg', 'Frasco marrom com tampa de cervo dourada do perfume Al Noble Wazeer da Lattafa'),
  ('P06', '/images/produto-yara.jpeg', 'Frasco rosa com detalhes prateados do perfume Yara da Lattafa'),
  ('P07', '/images/produto-khamrah.jpeg', 'Frasco de cristal âmbar do perfume Khamrah da Lattafa'),
  ('P08', '/images/produto-sabah-al-ward.jpeg', 'Frasco vermelho translúcido com tampa preta do perfume Sabah Al Ward da Al Wataniah'),
  ('P09', '/images/produto-victoria.jpeg', 'Frasco dourado com centro em mármore azul do perfume Victoria da Lattafa'),
  ('P10', '/images/produto-honor-glory.jpeg', 'Frasco branco com arabescos dourados do perfume Bade''e Al Oud Honor & Glory da Lattafa'),
  ('P11', '/images/produto-fakhar-rose.jpeg', 'Frasco branco e rosé do perfume Fakhar Rose da Lattafa'),
  ('P12', '/images/produto-mayar-cherry.jpeg', 'Frasco vermelho com tampa dourada do perfume Mayar Cherry Intense da Lattafa'),
  ('P13', '/images/produto-mousuf-musk.jpeg', 'Frasco transparente e branco do perfume Mousuf Musk'),
  ('P14', '/images/produto-dhermosa-2009.jpeg', 'Frasco branco do perfume D''Hermosa NO. 2009 de 30 mL'),
  ('P15', '/images/produto-dhermosa-2010.jpeg', 'Frasco preto do perfume D''Hermosa NO. 2010 de 30 mL'),
  ('P16', '/images/produto-dhermosa-2003.jpeg', 'Frasco transparente com tampa prateada do perfume D''Hermosa NO. 2003 de 30 mL'),
  ('P17', '/images/produto-dhermosa-1030.jpeg', 'Frasco âmbar com tampa esférica prateada do perfume D''Hermosa NO. 1030'),
  ('P18', '/images/produto-dhermosa-2008.jpeg', 'Frasco preto arredondado do perfume D''Hermosa NO. 2008 de 30 mL'),
  ('P19', '/images/produto-dhermosa-1028.jpeg', 'Frasco âmbar com tampa coral e dourada do perfume D''Hermosa NO. 1028'),
  ('P20', '/images/produto-dhermosa-1029.jpeg', 'Frasco rosa fosco com tampa esférica cromada do perfume D''Hermosa NO. 1029'),
  ('P21', '/images/produto-dhermosa-1037.jpeg', 'Frasco âmbar com tampa dourada do perfume D''Hermosa NO. 1037'),
  ('P22', '/images/produto-onlyou-ursinho.jpeg', 'Frasco rosa em forma de ursinho com coroa do perfume Collection Ursinho da Onlyou'),
  ('C01', '/images/produto-poco-c85.jpeg', 'Celular POCO C85 preto com a caixa amarela e o carregador de 33 W'),
  ('C02', '/images/produto-redmi-15.jpeg', 'Celular Redmi 15 preto com a caixa vermelha e o carregador de 33 W')
) AS v(seed_key, url, alt) ON v.seed_key = p.seed_key;

UPDATE public.store_settings
   SET logo_url = '/images/logo-cce.jpeg',
       hero_desktop_url = '/images/hero-lattafa-wide.jpeg',
       hero_mobile_url = '/images/hero-lattafa-square.jpeg',
       store_photo_url = '/images/loja-faixa.jpeg'
 WHERE key = 'default';

UPDATE public.products SET brand = 'Mousuf' WHERE seed_key = 'P13' AND brand IS NULL;

UPDATE public.admin_notes SET resolved = true
 WHERE title IN ('Foto correta do D''Hermosa NO. 1028', 'Fotos pendentes', 'Confirmar marca do Mousuf Musk');
