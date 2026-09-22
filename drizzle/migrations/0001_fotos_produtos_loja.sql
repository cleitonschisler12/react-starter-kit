-- Fotos reais dos produtos restantes + foto da loja (faixa de prateleiras)
DELETE FROM public.product_images
WHERE product_id IN (SELECT id FROM public.products WHERE seed_key IN ('P08', 'P09', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15', 'P16', 'P17', 'P18', 'P19', 'P21', 'P22', 'C01', 'C02'));

INSERT INTO public.product_images (product_id, url, alt_text, sort_order, is_primary)
SELECT p.id, v.url, v.alt, 0, true FROM public.products p
JOIN (VALUES
  ('P08', '/__l5e/assets-v1/7d1c07af-3fec-4b39-8e3f-c030061997be/produto-sabah-al-ward.jpeg', 'Frasco vermelho translúcido com tampa preta do perfume Sabah Al Ward da Al Wataniah'),
  ('P09', '/__l5e/assets-v1/acf2db55-223e-4d83-9d1d-48188c39d8af/produto-victoria.jpeg', 'Frasco dourado com centro em mármore azul do perfume Victoria da Lattafa'),
  ('P10', '/__l5e/assets-v1/6bf7a2a6-e136-4cc5-9a39-71aedd15d574/produto-honor-glory.jpeg', 'Frasco branco com arabescos dourados do perfume Bade''e Al Oud Honor & Glory da Lattafa'),
  ('P11', '/__l5e/assets-v1/01376b10-95c5-487b-83fa-17c23b3ca457/produto-fakhar-rose.jpeg', 'Frasco branco e rosé do perfume Fakhar Rose da Lattafa'),
  ('P12', '/__l5e/assets-v1/b053fb94-4a5a-4e7c-af01-c58302c0a44a/produto-mayar-cherry.jpeg', 'Frasco vermelho com tampa dourada do perfume Mayar Cherry Intense da Lattafa'),
  ('P13', '/__l5e/assets-v1/5639c26d-7c5d-46e1-8844-f83ebddcb7e8/produto-mousuf-musk.jpeg', 'Frasco transparente e branco do perfume Mousuf Musk'),
  ('P14', '/__l5e/assets-v1/a8ed23e6-0da2-49bb-a66e-5f9fa3220faf/produto-dhermosa-2009.jpeg', 'Frasco branco do perfume D''Hermosa NO. 2009 de 30 mL'),
  ('P15', '/__l5e/assets-v1/18332ed4-b925-427e-95f5-ec533a1bf84f/produto-dhermosa-2010.jpeg', 'Frasco preto do perfume D''Hermosa NO. 2010 de 30 mL'),
  ('P16', '/__l5e/assets-v1/98c5fddb-26e6-418c-b357-5143b7666274/produto-dhermosa-2003.jpeg', 'Frasco transparente com tampa prateada do perfume D''Hermosa NO. 2003 de 30 mL'),
  ('P17', '/__l5e/assets-v1/4958df88-f550-4f77-b79a-a802f64ed4b6/produto-dhermosa-1030.jpeg', 'Frasco âmbar com tampa esférica prateada do perfume D''Hermosa NO. 1030'),
  ('P18', '/__l5e/assets-v1/62a7b699-a87b-4ae1-a3c4-1e5245b0b992/produto-dhermosa-2008.jpeg', 'Frasco preto arredondado do perfume D''Hermosa NO. 2008 de 30 mL'),
  ('P19', '/__l5e/assets-v1/b613c84d-52c6-463f-a292-f34ab968afbc/produto-dhermosa-1028.jpeg', 'Frasco âmbar com tampa coral e dourada do perfume D''Hermosa NO. 1028'),
  ('P21', '/__l5e/assets-v1/c334664f-cebc-46bd-8f48-dd8535b022d2/produto-dhermosa-1037.jpeg', 'Frasco âmbar com tampa dourada do perfume D''Hermosa NO. 1037'),
  ('P22', '/__l5e/assets-v1/e73a5524-88a4-46b2-a524-3513e7100a29/produto-onlyou-ursinho.jpeg', 'Frasco rosa em forma de ursinho com coroa do perfume Collection Ursinho da Onlyou'),
  ('C01', '/__l5e/assets-v1/b428fa90-0f9e-4d97-a849-3476323749a0/produto-poco-c85.jpeg', 'Celular POCO C85 preto com a caixa amarela e o carregador de 33 W'),
  ('C02', '/__l5e/assets-v1/fc2cb3b5-8381-46ea-b64b-439cc8de114c/produto-redmi-15.jpeg', 'Celular Redmi 15 preto com a caixa vermelha e o carregador de 33 W')
) AS v(seed_key, url, alt) ON v.seed_key = p.seed_key;

UPDATE public.store_settings
   SET store_photo_url = '/__l5e/assets-v1/5c7a4d24-242c-4139-999b-acd3598d8e2c/loja-faixa.jpeg'
 WHERE key = 'default';

UPDATE public.admin_notes SET resolved = true
 WHERE title IN ('Foto correta do D''Hermosa NO. 1028', 'Fotos pendentes');
