DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typname='product_category') THEN
    CREATE TYPE public.product_category AS ENUM ('perfumes', 'celulares');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typname='product_gender') THEN
    CREATE TYPE public.product_gender AS ENUM ('masculino', 'feminino', 'unissex');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typname='product_availability') THEN
    CREATE TYPE public.product_availability AS ENUM ('available', 'sold_out');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typname='app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
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

DROP POLICY IF EXISTS "own roles readable" ON public.user_roles;
CREATE POLICY "own roles readable" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.products (
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

DROP POLICY IF EXISTS "public reads published products" ON public.products;
CREATE POLICY "public reads published products" ON public.products
  FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "admins read all products" ON public.products;
CREATE POLICY "admins read all products" ON public.products
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "admins insert products" ON public.products;
CREATE POLICY "admins insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "admins update products" ON public.products;
CREATE POLICY "admins update products" ON public.products
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "admins delete products" ON public.products;
CREATE POLICY "admins delete products" ON public.products
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_images_product_idx ON public.product_images(product_id);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public reads images of published products" ON public.product_images;
CREATE POLICY "public reads images of published products" ON public.product_images
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.published = true));
DROP POLICY IF EXISTS "admins manage images" ON public.product_images;
CREATE POLICY "admins manage images" ON public.product_images
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.payment_rules (
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
DROP POLICY IF EXISTS "public reads payment rules" ON public.payment_rules;
CREATE POLICY "public reads payment rules" ON public.payment_rules FOR SELECT USING (true);
DROP POLICY IF EXISTS "admins update payment rules" ON public.payment_rules;
CREATE POLICY "admins update payment rules" ON public.payment_rules
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.store_settings (
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
DROP POLICY IF EXISTS "public reads store settings" ON public.store_settings;
CREATE POLICY "public reads store settings" ON public.store_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "admins update store settings" ON public.store_settings;
CREATE POLICY "admins update store settings" ON public.store_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_notes TO authenticated;
GRANT ALL ON public.admin_notes TO service_role;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins manage notes" ON public.admin_notes;
CREATE POLICY "admins manage notes" ON public.admin_notes
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS products_touch ON public.products;
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();