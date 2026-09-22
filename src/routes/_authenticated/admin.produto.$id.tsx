import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  addProductImage,
  deleteProductImage,
  getAdminProduct,
  updateAdminProduct,
} from "@/lib/admin.functions";
import { sortedImages } from "@/lib/catalog";
import { btnGhost, btnGold, btnSubtle } from "@/components/site/buttons";

export const Route = createFileRoute("/_authenticated/admin/produto/$id")({
  head: () => ({
    meta: [
      { title: "Editar produto | CCE Imports" },
      { name: "description", content: "Edição de dados, preço e fotos do produto." },
      { property: "og:title", content: "Editar produto | CCE Imports" },
      { property: "og:description", content: "Edição interna de produto da CCE Imports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  loader: ({ params }) => getAdminProduct({ data: { id: params.id } }),
  errorComponent: () => (
    <main className="container-cce py-12">
      <h1 className="font-display text-xl font-semibold">Produto indisponível</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Verifique se você tem permissão de administrador e tente novamente.
      </p>
    </main>
  ),
  component: EditProduct,
});

function EditProduct() {
  const { product } = Route.useLoaderData();
  const save = useServerFn(updateAdminProduct);
  const addImage = useServerFn(addProductImage);
  const removeImage = useServerFn(deleteProductImage);

  const [form, setForm] = useState({
    name: product.name,
    brand: product.brand ?? "",
    base_price: (product.base_price_cents / 100).toFixed(2),
    short_description: product.short_description ?? "",
    description: product.description ?? "",
    aroma_profile: product.aroma_profile ?? "",
    volume_ml: product.volume_ml?.toString() ?? "",
    storage_gb: product.storage_gb?.toString() ?? "",
    ram_gb: product.ram_gb?.toString() ?? "",
    battery_mah: product.battery_mah?.toString() ?? "",
    color: product.color ?? "",
    condition: product.condition ?? "",
    warranty_text: product.warranty_text ?? "",
    availability: product.availability,
    published: product.published,
    featured: product.featured,
    sort_order: product.sort_order.toString(),
  });
  const [status, setStatus] = useState<string | null>(null);
  const [newImage, setNewImage] = useState({ url: "", alt_text: "", is_primary: false });

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("Salvando…");
    const cents = Math.round(Number(form.base_price.replace(",", ".")) * 100);
    try {
      await save({
        data: {
          id: product.id,
          name: form.name,
          brand: form.brand,
          base_price_cents: cents,
          short_description: form.short_description,
          description: form.description,
          aroma_profile: form.aroma_profile,
          volume_ml: form.volume_ml,
          storage_gb: form.storage_gb,
          ram_gb: form.ram_gb,
          battery_mah: form.battery_mah,
          color: form.color,
          condition: form.condition,
          warranty_text: form.warranty_text,
          availability: form.availability,
          published: form.published,
          featured: form.featured,
          sort_order: form.sort_order,
        },
      });
      setStatus("Produto atualizado.");
    } catch {
      setStatus("Não foi possível salvar. Confira os campos e tente novamente.");
    }
  }

  const isPerfume = product.category === "perfumes";
  const images = sortedImages(product);

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <div>
      <label htmlFor={key} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={key}
        type={type}
        value={String(form[key] ?? "")}
        onChange={(e) => set(key, e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm"
      />
    </div>
  );

  return (
    <main className="container-cce max-w-3xl py-8">
      <Link className={btnGhost} to="/admin">
        Voltar ao painel
      </Link>
      <h1 className="font-display mt-6 text-2xl font-semibold">{product.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isPerfume ? "Perfume" : "Celular"} • código interno {product.seed_key}
      </p>

      <form onSubmit={onSubmit} className="surface-card mt-6 space-y-4 p-5">
        {field("name", "Nome")}
        {field("brand", "Marca")}
        {field("base_price", "Preço base em reais (crédito à vista)")}
        <div>
          <label htmlFor="short_description" className="block text-sm font-medium">
            Descrição curta
          </label>
          <input
            id="short_description"
            value={form.short_description}
            onChange={(e) => set("short_description", e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Descrição completa
          </label>
          <textarea
            id="description"
            rows={5}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm"
          />
        </div>

        {isPerfume ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {field("volume_ml", "Volume (mL)", "number")}
            {field("aroma_profile", "Perfil de aroma")}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {field("storage_gb", "Armazenamento (GB)", "number")}
            {field("ram_gb", "Memória RAM (GB)", "number")}
            {field("battery_mah", "Bateria (mAh)", "number")}
            {field("color", "Cor")}
            {field("condition", "Condição")}
            {field("warranty_text", "Garantia")}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="availability" className="block text-sm font-medium">
              Disponibilidade
            </label>
            <select
              id="availability"
              value={form.availability}
              onChange={(e) => set("availability", e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm"
            >
              <option value="available">Disponível</option>
              <option value="sold_out">Esgotado</option>
            </select>
          </div>
          {field("sort_order", "Ordem no catálogo", "number")}
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            Publicado no site
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
            />
            Destaque
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className={btnGold}>
            Salvar alterações
          </button>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </div>
      </form>

      <section className="surface-card mt-6 p-5">
        <h2 className="font-display text-lg font-semibold">Fotos</h2>
        {images.length === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            Sem fotos. O site mostra “Foto em atualização” enquanto nenhuma foto real for adicionada.
          </p>
        )}
        <ul className="mt-3 flex flex-wrap gap-3">
          {images.map((img) => (
            <li key={img.url} className="w-28">
              <div className="bg-elevated flex h-28 items-center justify-center overflow-hidden rounded-md">
                <img src={img.url} alt="" className="h-full w-full object-contain" />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {img.is_primary ? "Principal" : `Ordem ${img.sort_order}`}
              </p>
              <button
                type="button"
                className={`${btnSubtle} mt-1 w-full`}
                onClick={async () => {
                  await removeImage({ data: { product_id: product.id, url: img.url } });
                  window.location.reload();
                }}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-5 space-y-3">
          <div>
            <label htmlFor="img_url" className="block text-sm font-medium">
              Endereço da nova foto
            </label>
            <input
              id="img_url"
              value={newImage.url}
              onChange={(e) => setNewImage((v) => ({ ...v, url: e.target.value }))}
              placeholder="https://…"
              className="mt-1 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="img_alt" className="block text-sm font-medium">
              Descrição da foto (acessibilidade)
            </label>
            <input
              id="img_alt"
              value={newImage.alt_text}
              onChange={(e) => setNewImage((v) => ({ ...v, alt_text: e.target.value }))}
              className="mt-1 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newImage.is_primary}
              onChange={(e) => setNewImage((v) => ({ ...v, is_primary: e.target.checked }))}
            />
            Usar como foto principal
          </label>
          <button
            type="button"
            className={btnGold}
            onClick={async () => {
              try {
                await addImage({ data: { product_id: product.id, ...newImage } });
                window.location.reload();
              } catch {
                setStatus("Endereço de foto inválido.");
              }
            }}
          >
            Adicionar foto
          </button>
        </div>
      </section>
    </main>
  );
}
