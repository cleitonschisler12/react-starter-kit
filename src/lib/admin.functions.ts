import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PRODUCT_COLUMNS, type Product } from "./catalog";

const AUTHORIZED_ADMIN_EMAIL = "contato.cceimports.com.br@gmail.com";

/** Lê o e-mail do token já validado pelo middleware (sem depender de sessão no servidor). */
function claimsEmail(context: { claims?: Record<string, unknown> }) {
  const raw = context.claims?.["email"];
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

async function hasAdminRole(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  return Boolean(data);
}

/** Garante que o usuário autenticado possui o papel de administrador. */
async function assertAdmin(context: { supabase: any; userId: string; claims?: any }) {
  if (await hasAdminRole(context)) return;
  // Conta do proprietário sem o papel gravado ainda: concede na hora.
  if (claimsEmail(context) === AUTHORIZED_ADMIN_EMAIL) {
    await grantAdminRole(context.userId);
    if (await hasAdminRole(context)) return;
  }
  throw new Error("Acesso restrito a administradores.");
}

async function grantAdminRole(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
  if (error) throw new Error(error.message);
}

/** Concede o papel somente à conta autenticada com o e-mail autorizado pelo proprietário. */
export const ensureAuthorizedAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Já é administrador no banco: nada a fazer.
    if (await hasAdminRole(context)) return { ok: true, isAdmin: true };

    if (claimsEmail(context) !== AUTHORIZED_ADMIN_EMAIL) {
      throw new Error("Esta conta não possui autorização administrativa.");
    }

    await grantAdminRole(context.userId);
    return { ok: true, isAdmin: true };
  });

export const getAdminSession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return { userId: context.userId, isAdmin: await hasAdminRole(context) };
  });


export const listAdminProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    const notes = await context.supabase
      .from("admin_notes")
      .select("id, title, body, resolved, created_at")
      .order("created_at", { ascending: false });
    return {
      products: (data ?? []) as unknown as Product[],
      notes: notes.data ?? [],
    };
  });

export const getAdminProduct = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => ({ id: String(data.id).slice(0, 64) }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: rows, error } = await context.supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("id", data.id)
      .limit(1);
    if (error) throw new Error(error.message);
    const product = ((rows ?? []) as unknown as Product[])[0];
    if (!product) throw new Error("Produto não encontrado.");
    return { product };
  });

type ProductUpdate = {
  id: string;
  name: string;
  brand: string | null;
  base_price_cents: number;
  short_description: string | null;
  description: string | null;
  aroma_profile: string | null;
  volume_ml: number | null;
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
};

const str = (v: unknown, max = 2000) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s.slice(0, max) : null;
};
const int = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};

export const updateAdminProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: Record<string, unknown>): ProductUpdate => {
    const price = int(raw["base_price_cents"]);
    if (!price || price < 100) throw new Error("Informe um preço válido.");
    const name = str(raw["name"], 160);
    if (!name) throw new Error("Informe o nome do produto.");
    return {
      id: String(raw["id"]).slice(0, 64),
      name,
      brand: str(raw["brand"], 80),
      base_price_cents: price,
      short_description: str(raw["short_description"], 300),
      description: str(raw["description"], 4000),
      aroma_profile: str(raw["aroma_profile"], 300),
      volume_ml: int(raw["volume_ml"]),
      storage_gb: int(raw["storage_gb"]),
      ram_gb: int(raw["ram_gb"]),
      battery_mah: int(raw["battery_mah"]),
      color: str(raw["color"], 60),
      condition: str(raw["condition"], 120),
      warranty_text: str(raw["warranty_text"], 300),
      availability: raw["availability"] === "sold_out" ? "sold_out" : "available",
      published: Boolean(raw["published"]),
      featured: Boolean(raw["featured"]),
      sort_order: int(raw["sort_order"]) ?? 0,
    };
  })
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { id, ...fields } = data;
    const { error } = await context.supabase.from("products").update(fields).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: Record<string, unknown>) => {
    const url = str(raw["url"], 500);
    if (!url || !/^(https?:\/\/|\/)/.test(url)) throw new Error("Informe um endereço de foto válido.");
    return {
      product_id: String(raw["product_id"]).slice(0, 64),
      url,
      alt_text: str(raw["alt_text"], 200),
      is_primary: Boolean(raw["is_primary"]),
      sort_order: int(raw["sort_order"]) ?? 0,
    };
  })
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    if (data.is_primary) {
      await context.supabase
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", data.product_id);
    }
    const { error } = await context.supabase.from("product_images").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: { product_id: string; url: string }) => ({
    product_id: String(raw.product_id).slice(0, 64),
    url: String(raw.url).slice(0, 500),
  }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("product_images")
      .delete()
      .eq("product_id", data.product_id)
      .eq("url", data.url);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/** Recebe uma foto do painel, guarda no armazenamento da loja e devolve o endereço público. */
export const uploadAdminImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: Record<string, unknown>) => {
    const contentType = String(raw["content_type"] ?? "");
    if (!IMAGE_TYPES.has(contentType)) {
      throw new Error("Envie uma imagem JPG, PNG, WEBP ou AVIF.");
    }
    const payload = String(raw["data"] ?? "");
    if (!payload) throw new Error("Selecione uma imagem.");
    if (payload.length > 14_000_000) throw new Error("Imagem muito grande. Use até 10 MB.");
    const rawName = String(raw["filename"] ?? "foto.jpg")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .slice(-80);
    return {
      filename: rawName || "foto.jpg",
      content_type: contentType,
      data: payload,
      folder: raw["folder"] === "loja" ? "loja" : "produtos",
    };
  })
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bytes = Buffer.from(data.data, "base64");
    const path = `${data.folder}/${Date.now()}-${data.filename}`;
    const { error } = await supabaseAdmin.storage
      .from("produtos")
      .upload(path, bytes, { contentType: data.content_type, upsert: false });
    if (error) throw new Error(error.message);
    return { url: `/api/public/foto/${path}` };
  });

export const getAdminSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("store_settings")
      .select("*")
      .eq("key", "default")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { settings: data };
  });

export const updateAdminSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: Record<string, unknown>) => ({
    hero_overline: str(raw["hero_overline"], 120),
    hero_title: str(raw["hero_title"], 160),
    hero_description: str(raw["hero_description"], 400),
    logo_url: str(raw["logo_url"], 500),
    hero_desktop_url: str(raw["hero_desktop_url"], 500),
    hero_mobile_url: str(raw["hero_mobile_url"], 500),
    store_photo_url: str(raw["store_photo_url"], 500),
  }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("store_settings")
      .update(data)
      .eq("key", "default");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleAdminNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: { id: string; resolved: boolean }) => ({
    id: String(raw.id).slice(0, 64),
    resolved: Boolean(raw.resolved),
  }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("admin_notes")
      .update({ resolved: data.resolved })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
