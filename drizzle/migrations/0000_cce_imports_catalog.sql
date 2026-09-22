-- ENUMS
CREATE TYPE public.product_category AS ENUM ('perfumes', 'celulares');
CREATE TYPE public.product_gender AS ENUM ('masculino', 'feminino', 'unissex');
CREATE TYPE public.product_availability AS ENUM ('available', 'sold_out');
CREATE TYPE public.app_role AS ENUM ('admin');

-- ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles readable" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_key text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  brand text,
  category public.product_category NOT NULL,
  gender public.product_gender,
  volume_ml integer,
  base_price_cents integer NOT NULL CHECK (base_price_cents > 0),
  short_description text,
  description text,
  aroma_profile text,
  storage_gb integer,
  ram_gb integer,
  battery_mah integer,
  color text,
  condition text,
  warranty_text text,
  availability public.product_availability NOT NULL DEFAULT 'available',
  published boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 100,
  search_aliases text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public reads published products" ON public.products
  FOR SELECT USING (published = true);
CREATE POLICY "admins read all products" ON public.products
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update products" ON public.products
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete products" ON public.products
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- IMAGES
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_images_product_idx ON public.product_images(product_id);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public reads images of published products" ON public.product_images
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.published = true));
CREATE POLICY "admins manage images" ON public.product_images
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PAYMENT RULES
CREATE TABLE public.payment_rules (
  category public.product_category PRIMARY KEY,
  max_installments integer NOT NULL CHECK (max_installments BETWEEN 1 AND 24),
  discount_installments_max integer NOT NULL DEFAULT 1,
  discount_installments_pct numeric(5,2) NOT NULL DEFAULT 0,
  debit_pct numeric(5,2) NOT NULL DEFAULT 0,
  pix_pct numeric(5,2) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_rules TO anon;
GRANT SELECT, UPDATE ON public.payment_rules TO authenticated;
GRANT ALL ON public.payment_rules TO service_role;
ALTER TABLE public.payment_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads payment rules" ON public.payment_rules FOR SELECT USING (true);
CREATE POLICY "admins update payment rules" ON public.payment_rules
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.payment_rules (category, max_installments, discount_installments_max, discount_installments_pct, debit_pct, pix_pct) VALUES
  ('perfumes', 3, 1, 5, 10, 15),
  ('celulares', 12, 5, 10, 15, 20);

-- STORE SETTINGS
CREATE TABLE public.store_settings (
  key text PRIMARY KEY,
  store_name text NOT NULL,
  whatsapp text NOT NULL,
  instagram_handle text,
  instagram_url text,
  address_line text,
  city text,
  state text,
  hours_weekdays text,
  hours_saturday text,
  hours_sunday text,
  delivery_note text,
  hero_overline text,
  hero_title text,
  hero_description text,
  logo_url text,
  hero_desktop_url text,
  hero_mobile_url text,
  store_photo_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_settings TO anon;
GRANT SELECT, UPDATE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads store settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "admins update store settings" ON public.store_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.store_settings (key, store_name, whatsapp, instagram_handle, instagram_url, address_line, city, state,
  hours_weekdays, hours_saturday, hours_sunday, delivery_note, hero_overline, hero_title, hero_description,
  logo_url, hero_desktop_url, hero_mobile_url)
VALUES ('default', 'CCE Imports', '5546999864663', '@cceimports.oficial', 'https://www.instagram.com/cceimports.oficial/',
  'Avenida Brasília, 430, Centro', 'Espigão Alto do Iguaçu', 'PR',
  '08h às 11h30 e 13h às 18h', '08h às 12h', 'Sem horário informado',
  'Entrega grátis nas áreas urbanas de Espigão Alto do Iguaçu e Quedas do Iguaçu. Outras cidades: envio pelos Correios com frete e prazo consultados pelo CEP.',
  'CCE IMPORTS • PERFUMES E CELULARES', 'Seu próximo perfume. Seu novo celular.',
  'Explore nossa seleção, compare as opções e escolha com atendimento próximo pelo WhatsApp.',
  '/__l5e/assets-v1/a1f8f11c-8273-4950-a970-e8e4e92658e1/logo.jpg',
  '/__l5e/assets-v1/2747431d-9d38-4554-ad5c-8ff95cf6efa7/a.jpg',
  '/__l5e/assets-v1/14576ff7-43da-45f6-ab49-be6a312a96d5/b.jpg');

-- ADMIN PENDING NOTES (private)
CREATE TABLE public.admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_notes TO authenticated;
GRANT ALL ON public.admin_notes TO service_role;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage notes" ON public.admin_notes
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.admin_notes (title, body) VALUES
  ('Revisar redação da garantia dos celulares', 'Proprietário informou 1 mês. Texto comercial precisa de revisão antes de publicar.'),
  ('Foto correta do D''Hermosa NO. 1028', 'A arte disponível mostra o código 1020. Enviar foto original correta.'),
  ('Fotos pendentes', 'Faltam fotos profissionais de: Sabah Al Ward, Victoria, Honor & Glory, Fakhar Rose, Mayar Cherry Intense, Mousuf Musk, D''Hermosa (todos), Onlyou Ursinho, POCO C85, Redmi 15.'),
  ('Confirmar marca do Mousuf Musk', 'Marca mantida nula no banco até confirmação.');

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- SEED: 22 perfumes + 2 celulares (idempotente por seed_key)
INSERT INTO public.products (seed_key, slug, name, brand, category, gender, volume_ml, base_price_cents, short_description, aroma_profile, featured, sort_order, search_aliases) VALUES
('P01','asad-lattafa','Asad','Lattafa','perfumes','masculino',100,27000,'Especiado e amadeirado, com pimenta, café, âmbar e baunilha.','Especiado, amadeirado','true','1','{"asad","lattafa","leao"}'),
('P02','asad-elixir-lattafa','Asad Elixir','Lattafa','perfumes','masculino',100,31000,'Tabaco e madeiras, com especiarias, baunilha e fundo de incenso.','Tabaco, amadeirado','true','5','{"asad elixir","elixir"}'),
('P03','club-de-nuit-intense-man-armaf','Club de Nuit Intense Man','Armaf','perfumes','masculino',105,31000,'Cítrico e frutado, com limão, abacaxi e fundo amadeirado.','Cítrico, frutado','false','20','{"club de nuit","cdni","armaf","intense man"}'),
('P04','badee-al-oud-oud-for-glory-lattafa','Bade''e Al Oud Oud for Glory','Lattafa','perfumes','masculino',100,22000,'Amadeirado e especiado, com oud, açafrão e patchouli.','Amadeirado, especiado','false','21','{"badee al oud","oud for glory","oud"}'),
('P05','al-noble-wazeer-lattafa','Al Noble Wazeer','Lattafa','perfumes','masculino',100,24000,'Frutado e amadeirado, com abertura fresca e nuances de chocolate.','Frutado, amadeirado','false','22','{"al noble","wazeer","noble"}'),
('P06','yara-lattafa','Yara','Lattafa','perfumes','feminino',100,25000,'Doce e cremoso, com frutas tropicais, flores e baunilha.','Doce, cremoso','true','2','{"yara","yara rosa","yara original"}'),
('P07','khamrah-lattafa','Khamrah','Lattafa','perfumes','unissex',100,24000,'Doce e especiado, com canela, tâmaras, pralinê e baunilha.','Doce, especiado','true','4','{"khamrah","kamrah"}'),
('P08','sabah-al-ward-al-wataniah','Sabah Al Ward','Al Wataniah','perfumes','feminino',100,18000,'Floral adocicado, com flor de laranjeira, jasmim, cacau e baunilha.','Floral adocicado','false','23','{"sabah al ward","sabah","al wataniah"}'),
('P09','victoria-lattafa','Victoria','Lattafa','perfumes','feminino',100,25000,'Doce com toque cítrico, remetendo à torta de limão, com neroli e baunilha.','Doce, cítrico','false','24','{"victoria","vitoria"}'),
('P10','badee-al-oud-honor-and-glory-lattafa','Bade''e Al Oud Honor & Glory','Lattafa','perfumes','unissex',100,24000,'Abacaxi e crème brûlée, com especiarias e fundo de baunilha e madeiras.','Frutado, gourmand','false','25','{"honor and glory","honor & glory","badee al oud"}'),
('P11','fakhar-rose-lattafa','Fakhar Rose','Lattafa','perfumes','feminino',100,28000,'Floral, com tuberosa, jasmim e fundo suave de baunilha e musk.','Floral','true','3','{"fakhar","fakhar rose","fakhar lattafa","rose"}'),
('P12','mayar-cherry-intense-lattafa','Mayar Cherry Intense','Lattafa','perfumes','feminino',100,22000,'Frutado e doce, com geleia de cereja, morango, cacau e baunilha.','Frutado, doce','true','6','{"mayar","cherry","cereja","mayar cherry"}'),
('P13','mousuf-musk','Mousuf Musk',NULL,'perfumes','unissex',50,7500,'Musk suave, com sensação de limpeza e conforto.','Musk','false','30','{"mousuf","musk","mousuf musk"}'),
('P14','dhermosa-2009','D''Hermosa NO. 2009','D''Hermosa','perfumes','masculino',30,4000,'Aroma intenso, para quem prefere fragrâncias com presença.',NULL,'false','40','{"dhermosa","hermosa","2009","no 2009"}'),
('P15','dhermosa-2010','D''Hermosa NO. 2010','D''Hermosa','perfumes','masculino',30,4000,'Aroma envolvente e elegante.',NULL,'false','41','{"dhermosa","hermosa","2010","no 2010"}'),
('P16','dhermosa-2003','D''Hermosa NO. 2003','D''Hermosa','perfumes','masculino',30,4000,'Aroma intenso e envolvente.',NULL,'false','42','{"dhermosa","hermosa","2003","no 2003"}'),
('P17','dhermosa-1030','D''Hermosa NO. 1030','D''Hermosa','perfumes','masculino',26,4000,'Amadeirado com um toque levemente fresco.',NULL,'false','43','{"dhermosa","hermosa","1030","no 1030"}'),
('P18','dhermosa-2008','D''Hermosa NO. 2008','D''Hermosa','perfumes','masculino',30,4000,'Amadeirado com leve toque adocicado.',NULL,'false','44','{"dhermosa","hermosa","2008","no 2008"}'),
('P19','dhermosa-1028','D''Hermosa NO. 1028','D''Hermosa','perfumes','feminino',26,4000,'Frutado e floral, com um toque adocicado.',NULL,'false','45','{"dhermosa","hermosa","1028","no 1028","1020"}'),
('P20','dhermosa-1029','D''Hermosa NO. 1029','D''Hermosa','perfumes','feminino',26,4000,'Floral com toque adocicado e cremoso.',NULL,'false','46','{"dhermosa","hermosa","1029","no 1029"}'),
('P21','dhermosa-1037','D''Hermosa NO. 1037','D''Hermosa','perfumes','feminino',28,4000,'Floral e frutado, com um toque doce.',NULL,'false','47','{"dhermosa","hermosa","1037","no 1037"}'),
('P22','onlyou-collection-ursinho','Collection Ursinho','Onlyou','perfumes','feminino',30,5000,'Aroma suave e adocicado em um frasco de ursinho.',NULL,'false','48','{"onlyou","ursinho","collection ursinho"}');

INSERT INTO public.products (seed_key, slug, name, brand, category, base_price_cents, short_description, storage_gb, ram_gb, battery_mah, color, condition, featured, sort_order, search_aliases) VALUES
('C01','poco-c85','POCO C85','POCO','celulares',150000,'128 GB de armazenamento, 6 GB de RAM e bateria de 6.000 mAh.',128,6,6000,'Preto','Novo','true','1','{"poco","c85","poco c85","xiaomi"}'),
('C02','redmi-15','Redmi 15','Redmi','celulares',160000,'128 GB de armazenamento, 6 GB de RAM e bateria de 7.000 mAh.',128,6,7000,'Preto','Novo','true','2','{"redmi","redmi 15","xiaomi","15"}');

-- IMAGENS DISPONÍVEIS
INSERT INTO public.product_images (product_id, url, alt_text, sort_order, is_primary)
SELECT p.id, v.url, v.alt, 0, true FROM public.products p
JOIN (VALUES
  ('P01','/__l5e/assets-v1/71307b43-fd81-4dd5-bf9f-1c9be3d5ab78/c.jpg','Frasco preto e dourado do perfume Asad da Lattafa'),
  ('P02','/__l5e/assets-v1/0a3fe4a8-8142-4447-9655-8ef541504f56/d.jpg','Frasco preto com detalhes rosé do perfume Asad Elixir da Lattafa'),
  ('P03','/__l5e/assets-v1/4101be7b-1e99-4cc3-bdfa-44a76b58bdb6/e.jpg','Frasco preto do perfume Club de Nuit Intense Man da Armaf'),
  ('P04','/__l5e/assets-v1/f42bba72-7078-45bc-a7eb-2d36d4680017/f.jpg','Frasco preto e dourado do perfume Bade''e Al Oud Oud for Glory da Lattafa'),
  ('P05','/__l5e/assets-v1/78462b05-548c-4387-835d-3f11a7f48cdb/g.jpg','Frasco marrom com tampa de cervo dourada do perfume Al Noble Wazeer da Lattafa'),
  ('P06','/__l5e/assets-v1/a16703e4-06bc-455c-8880-8e5d4fd089f7/h.jpg','Frasco rosa com detalhes prateados do perfume Yara da Lattafa'),
  ('P07','/__l5e/assets-v1/c646398c-3a25-4fe4-8e86-525f5472606c/i.jpg','Frasco de cristal âmbar do perfume Khamrah da Lattafa')
) AS v(seed_key, url, alt) ON v.seed_key = p.seed_key;