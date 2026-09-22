import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { PRODUCT_COLUMNS, type Product } from "./catalog";
import { DEFAULT_RULES, type Category, type PaymentRules } from "./pricing";

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type StoreSettings = {
  store_name: string;
  whatsapp: string;
  hero_overline: string | null;
  hero_title: string | null;
  hero_description: string | null;
  logo_url: string | null;
  hero_desktop_url: string | null;
  hero_mobile_url: string | null;
  store_photo_url: string | null;
};

export type PublicCatalog = {
  products: Product[];
  rules: Record<Category, PaymentRules>;
  settings: StoreSettings | null;
};

async function loadRulesAndSettings(client: ReturnType<typeof publicClient>) {
  const [rulesRes, settingsRes] = await Promise.all([
    client.from("payment_rules").select("*"),
    client
      .from("store_settings")
      .select(
        "store_name, whatsapp, hero_overline, hero_title, hero_description, logo_url, hero_desktop_url, hero_mobile_url, store_photo_url",
      )
      .eq("key", "default")
      .maybeSingle(),
  ]);
  if (rulesRes.error) throw new Error(rulesRes.error.message);
  const rules = { ...DEFAULT_RULES };
  for (const row of rulesRes.data ?? []) {
    rules[row.category as Category] = {
      category: row.category as Category,
      max_installments: row.max_installments,
      discount_installments_max: row.discount_installments_max,
      discount_installments_pct: Number(row.discount_installments_pct),
      debit_pct: Number(row.debit_pct),
      pix_pct: Number(row.pix_pct),
    };
  }
  return { rules, settings: (settingsRes.data as StoreSettings | null) ?? null };
}

export const getPublicCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicCatalog> => {
    const client = publicClient();
    const [{ data, error }, extra] = await Promise.all([
      client
        .from("products")
        .select(PRODUCT_COLUMNS)
        .eq("published", true)
        .order("sort_order", { ascending: true }),
      loadRulesAndSettings(client),
    ]);
    if (error) throw new Error(error.message);
    return { products: (data ?? []) as unknown as Product[], ...extra };
  },
);

export const getPublicProduct = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 200) }))
  .handler(async ({ data }) => {
    const client = publicClient();
    const [{ data: rows, error }, extra] = await Promise.all([
      client
        .from("products")
        .select(PRODUCT_COLUMNS)
        .eq("published", true)
        .eq("slug", data.slug)
        .limit(1),
      loadRulesAndSettings(client),
    ]);
    if (error) throw new Error(error.message);
    const product = ((rows ?? []) as unknown as Product[])[0] ?? null;
    if (!product) return { product: null, related: [] as Product[], ...extra };
    const { data: related } = await client
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("published", true)
      .eq("category", product.category)
      .neq("id", product.id)
      .order("availability", { ascending: true })
      .order("sort_order", { ascending: true })
      .limit(4);
    return {
      product,
      related: (related ?? []) as unknown as Product[],
      ...extra,
    };
  });
