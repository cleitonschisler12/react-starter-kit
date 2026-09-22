-- Fotos reais dos produtos restantes e foto da loja (faixa de prateleiras)
DELETE FROM public.product_images
WHERE product_id IN (SELECT id FROM public.products WHERE seed_key IN (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+));

INSERT INTO public.product_images (product_id, url, alt_text, sort_order, is_primary)
SELECT p.id, v.url, v.alt, 0, true FROM public.products p
JOIN (VALUES
  (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+),
  (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+),
  (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+),
  (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+),
  (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+),
  (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+),
  (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+),
  (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+),
  (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+),
  (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+),
  (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+),
  (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+),
  (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+),
  (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+),
  (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+),
  (+s.replace(/'/g,)+,+s.replace(/'/g,)+,+s.replace(/'/g,)+)
) AS v(seed_key, url, alt) ON v.seed_key = p.seed_key;

UPDATE public.store_settings
   SET store_photo_url = +s.replace(/'/g,)+
 WHERE key = default;

UPDATE public.admin_notes SET resolved = true
 WHERE title IN (+s.replace(/'/g,)+, +s.replace(/'/g,)+);
