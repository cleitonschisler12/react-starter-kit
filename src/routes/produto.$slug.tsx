import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { ProductCard } from "@/components/site/ProductCard";
import { btnGhost, btnGold, btnWhats } from "@/components/site/buttons";
import { getPublicProduct } from "@/lib/catalog.functions";
import { productDetail, sortedImages, type Product } from "@/lib/catalog";
import {
  creditTotal,
  debitPrice,
  describePlan,
  formatBRL,
  paymentTable,
  pixPrice,
  type PaymentRules,
} from "@/lib/pricing";
import { publicProductUrl, waLink, waOrderMessage, waRestockMessage } from "@/lib/store";

export const Route = createFileRoute("/produto/$slug")({
  loader: async ({ params }) => {
    const result = await getPublicProduct({ data: { slug: params.slug } });
    if (!result.product) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.product) {
      return {
        meta: [
          { title: "Produto não encontrado | CCE Imports" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const p = loaderData.product;
    const detail = productDetail(p);
    const title = `${p.name}${detail ? ` — ${detail}` : ""} | CCE Imports`;
    const description =
      p.short_description ??
      `${p.name} disponível na CCE Imports. Consulte valores, formas de pagamento e disponibilidade pelo WhatsApp.`;
    const image = sortedImages(p)[0]?.url;
    const absolute = image && image.startsWith("http") ? image : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(absolute
          ? [
              { property: "og:image", content: absolute },
              { name: "twitter:image", content: absolute },
            ]
          : []),
      ],
    };
  },
  notFoundComponent: ProductNotFound,
  errorComponent: ProductError,
  component: ProductPage,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="container-cce py-12">{children}</main>
      <SiteFooter />
    </>
  );
}

function ProductNotFound() {
  return (
    <Shell>
      <h1 className="font-display text-2xl font-semibold">Produto não encontrado</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Este produto pode ter saído do catálogo. Veja as opções disponíveis.
      </p>
      <Link className={`${btnGold} mt-6`} to="/" hash="catalogo">
        Voltar ao catálogo
      </Link>
    </Shell>
  );
}

function ProductError() {
  return (
    <Shell>
      <h1 className="font-display text-2xl font-semibold">Não foi possível carregar o produto</h1>
      <p className="mt-2 text-sm text-muted-foreground">Tente novamente em instantes.</p>
      <button type="button" className={`${btnGhost} mt-6`} onClick={() => window.location.reload()}>
        Tentar novamente
      </button>
    </Shell>
  );
}

function ProductPage() {
  const { product, related, rules, settings } = Route.useLoaderData();
  const p = product as Product;
  const rule: PaymentRules = rules[p.category];
  const images = sortedImages(p);
  const [active, setActive] = useState(0);
  const detail = productDetail(p);
  const soldOut = p.availability === "sold_out";
  const siteOrigin = useSiteOrigin();
  const url = publicProductUrl(p.slug, siteOrigin);

  const [installments, setInstallments] = useState(1);
  const table = useMemo(() => paymentTable(p.base_price_cents, rule), [p.base_price_cents, rule]);
  const creditSelected = creditTotal(p.base_price_cents, installments, rule);
  const planText = describePlan(creditSelected, installments);

  const orderLink = (payment: string, total: number, plan?: string) =>
    waLink(
      waOrderMessage({
        name: p.name,
        detail,
        payment,
        total: formatBRL(total),
        installments: plan ?? null,
        url,
      }),
    );

  const specs: Array<[string, string]> = [];
  if (p.brand) specs.push(["Marca", p.brand]);
  if (p.volume_ml) specs.push(["Volume", `${p.volume_ml} mL`]);
  if (p.gender)
    specs.push([
      "Público",
      p.gender === "masculino" ? "Masculino" : p.gender === "feminino" ? "Feminino" : "Unissex",
    ]);
  if (p.aroma_profile) specs.push(["Perfil", p.aroma_profile]);
  if (p.storage_gb) specs.push(["Armazenamento", `${p.storage_gb} GB`]);
  if (p.ram_gb) specs.push(["Memória RAM", `${p.ram_gb} GB`]);
  if (p.battery_mah) specs.push(["Bateria", `${p.battery_mah} mAh`]);
  if (p.color) specs.push(["Cor", p.color]);
  if (p.condition) specs.push(["Condição", p.condition]);
  if (p.warranty_text) specs.push(["Garantia", p.warranty_text]);

  return (
    <>
      <SiteHeader logoUrl={settings?.logo_url} />

      <main className="container-cce py-8 lg:py-12">
        <nav aria-label="Trilha de navegação" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Início
          </Link>
          <span aria-hidden="true"> / </span>
          <Link
            to="/"
            search={{ categoria: p.category === "celulares" ? "celulares" : undefined }}
            hash="catalogo"
            className="hover:text-foreground"
          >
            {p.category === "celulares" ? "Celulares" : "Perfumes"}
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="text-foreground">{p.name}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <div className="surface-card flex aspect-square items-center justify-center overflow-hidden p-4">
              {images.length ? (
                <img
                  src={images[active]?.url}
                  alt={images[active]?.alt_text ?? `${p.name} — CCE Imports`}
                  width={1000}
                  height={1000}
                  className="h-full w-full object-contain"
                />
              ) : (
                <p className="px-6 text-center text-sm text-muted-foreground">
                  Foto em atualização. Fale com a loja para receber fotos reais deste produto.
                </p>
              )}
            </div>
            {images.length > 1 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <li key={img.url}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`Ver foto ${i + 1} de ${p.name}`}
                      aria-current={i === active}
                      className={`h-16 w-16 overflow-hidden rounded-md border ${
                        i === active ? "border-primary" : "border-border"
                      }`}
                    >
                      <img src={img.url} alt="" className="h-full w-full object-contain" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="eyebrow">{p.brand ?? (p.category === "celulares" ? "Celular" : "Perfume")}</p>
            <h1 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">{p.name}</h1>
            {detail && <p className="mt-1 text-sm text-muted-foreground">{detail}</p>}

            <p
              className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs ${
                soldOut ? "bg-elevated text-muted-foreground" : "bg-whats/15 text-whats"
              }`}
            >
              {soldOut ? "Esgotado" : "Disponível"}
            </p>

            <div className="surface-card mt-5 p-5">
              <p className="text-sm text-muted-foreground">No Pix ou dinheiro</p>
              <p className="font-display text-3xl font-semibold text-gold">
                {formatBRL(pixPrice(p.base_price_cents, rule))}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                No débito {formatBRL(debitPrice(p.base_price_cents, rule))} • No crédito até{" "}
                {rule.max_installments}x
              </p>

              <div className="mt-4">
                <label htmlFor="parcelas" className="block text-sm font-medium">
                  Simular crédito
                </label>
                <select
                  id="parcelas"
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm"
                >
                  {Array.from({ length: rule.max_installments }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}x
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm">{planText}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {soldOut ? (
                  <a
                    className={btnWhats}
                    href={waLink(waRestockMessage(p.name, url))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Consultar reposição
                  </a>
                ) : (
                  <>
                    <a
                      className={btnWhats}
                      href={orderLink("Pix ou dinheiro", pixPrice(p.base_price_cents, rule))}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Pedir no WhatsApp (Pix)
                    </a>
                    <a
                      className={btnGhost}
                      href={orderLink(`Crédito em ${installments}x`, creditSelected, planText)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Pedir no crédito
                    </a>
                  </>
                )}
              </div>
            </div>

            {p.description && (
              <div className="mt-6">
                <h2 className="font-display text-lg font-semibold">Sobre o produto</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
              </div>
            )}

            {specs.length > 0 && (
              <div className="mt-6">
                <h2 className="font-display text-lg font-semibold">Ficha técnica</h2>
                <dl className="mt-2 divide-y divide-border text-sm">
                  {specs.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-2">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="mt-6">
              <h2 className="font-display text-lg font-semibold">Formas de pagamento</h2>
              <table className="mt-2 w-full text-sm">
                <caption className="sr-only">Valores por forma de pagamento</caption>
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th scope="col" className="py-2 font-medium">
                      Forma
                    </th>
                    <th scope="col" className="py-2 text-right font-medium">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {table.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className="py-2 text-left font-normal">
                        {row.label}
                        {row.note && (
                          <span className="block text-xs text-muted-foreground">{row.note}</span>
                        )}
                      </th>
                      <td className="py-2 text-right">{formatBRL(row.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-muted-foreground">
                Descontos não são cumulativos. Valores confirmados no atendimento.
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-xl font-semibold">Você também pode gostar</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <li key={item.id}>
                  <ProductCard product={item} rules={rules[item.category]} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <SiteFooter logoUrl={settings?.logo_url} />
      <WhatsAppFab />
    </>
  );
}
