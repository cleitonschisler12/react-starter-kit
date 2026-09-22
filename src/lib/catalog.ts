import type { Category, PaymentRules } from "./pricing";

export type ProductImage = {
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

export type Product = {
  id: string;
  seed_key: string;
  slug: string;
  name: string;
  brand: string | null;
  category: Category;
  gender: "masculino" | "feminino" | "unissex" | null;
  volume_ml: number | null;
  base_price_cents: number;
  short_description: string | null;
  description: string | null;
  aroma_profile: string | null;
  storage_gb: number | null;
  ram_gb: number | null;
  battery_mah: number | null;
  color: string | null;
  condition: string | null;
  warranty_text: string | null;
  availability: "available" | "sold_out";
  published: boolean;
  featured: boolean;
  sort_order: number;
  search_aliases: string[];
  product_images: ProductImage[];
};

export const PRODUCT_COLUMNS =
  "id, seed_key, slug, name, brand, category, gender, volume_ml, base_price_cents, short_description, description, aroma_profile, storage_gb, ram_gb, battery_mah, color, condition, warranty_text, availability, published, featured, sort_order, search_aliases, product_images(url, alt_text, sort_order, is_primary)";

export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function matchesQuery(product: Product, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const haystack = normalize(
    [
      product.name,
      product.brand ?? "",
      product.category,
      product.short_description ?? "",
      product.aroma_profile ?? "",
      product.seed_key,
      ...product.search_aliases,
    ].join(" "),
  );
  return q.split(" ").every((term) => haystack.includes(term));
}

export function primaryImage(product: Product): ProductImage | null {
  const images = [...product.product_images].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
  );
  return images[0] ?? null;
}

export function sortedImages(product: Product): ProductImage[] {
  return [...product.product_images].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
  );
}

/** Detalhe curto usado no card e nas mensagens de WhatsApp. */
export function productDetail(product: Product): string | null {
  if (product.category === "perfumes") {
    return product.volume_ml ? `${product.volume_ml} mL` : null;
  }
  const parts = [
    product.storage_gb ? `${product.storage_gb} GB` : null,
    product.color ?? null,
  ].filter(Boolean);
  return parts.length ? parts.join(" • ") : null;
}

export type RulesMap = Record<Category, PaymentRules>;
