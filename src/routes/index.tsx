import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { Catalog, type CatalogFilters } from "@/components/site/Catalog";
import { Faq } from "@/components/site/Faq";
import { Benefits, CustomOrder, PerfumeHelp, StoreInfo } from "@/components/site/StoreSections";
import { btnGhost, btnGold, btnWhats } from "@/components/site/buttons";
import { getPublicCatalog } from "@/lib/catalog.functions";
import { FULL_ADDRESS, STORE, WA_GENERAL, waLink } from "@/lib/store";
import heroWide from "@/assets/hero-lattafa-wide.jpeg.asset.json";
import heroSquare from "@/assets/hero-lattafa-square.jpeg.asset.json";

type Search = {
  categoria?: "perfumes" | "celulares" | undefined;
  q?: string | undefined;
  publico?: "todos" | "masculino" | "feminino" | "unissex" | undefined;
  marca?: string | undefined;
  ordem?: "destaques" | "menor" | "maior" | "nome" | undefined;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    categoria: search["categoria"] === "celulares" ? "celulares" : undefined,
    q: typeof search["q"] === "string" && search["q"] ? search["q"].slice(0, 80) : undefined,
    publico: (["masculino", "feminino", "unissex"] as const).includes(search["publico"] as never)
      ? (search["publico"] as Search["publico"])
      : undefined,
    marca:
      typeof search["marca"] === "string" && search["marca"]
        ? search["marca"].slice(0, 60)
        : undefined,
    ordem: (["menor", "maior", "nome"] as const).includes(search["ordem"] as never)
      ? (search["ordem"] as Search["ordem"])
      : undefined,
  }),
  loader: () => getPublicCatalog(),
  head: () => ({
    meta: [
      { title: "CCE Imports | Perfumes e Celulares em Espigão Alto do Iguaçu" },
      {
        name: "description",
        content:
          "Conheça os perfumes e celulares da CCE Imports. Loja física em Espigão Alto do Iguaçu, entrega gratuita nas áreas urbanas de Espigão e Quedas e pedidos pelo WhatsApp.",
      },
      { property: "og:title", content: "CCE Imports | Perfumes e Celulares" },
      {
        property: "og:description",
        content:
          "Perfumes e celulares com atendimento pelo WhatsApp. Loja física em Espigão Alto do Iguaçu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: CatalogError,
  component: Home,
});

function CatalogError() {
  return (
    <main className="container-cce flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="font-display text-2xl font-semibold">Não foi possível carregar o catálogo</h1>
      <p className="mt-2 text-muted-foreground">
        Tente novamente em instantes ou fale com a loja pelo WhatsApp.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" className={btnGhost} onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
        <a className={btnWhats} href={waLink(WA_GENERAL)} target="_blank" rel="noopener noreferrer">
          Conversar no WhatsApp
        </a>
      </div>
    </main>
  );
}

function Home() {
  const { products, rules, settings } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });

  const filters: CatalogFilters = {
    categoria: search.categoria ?? "perfumes",
    q: search.q ?? "",
    publico: search.publico ?? "todos",
    marca: search.marca ?? "",
    ordem: search.ordem ?? "destaques",
  };

  const onChange = (next: Partial<CatalogFilters>) => {
    navigate({
      search: (prev) => ({ ...prev, ...next }),
      hash: "catalogo",
      replace: true,
      resetScroll: false,
    });
  };

  return (
    <>
      <div className="bg-elevated text-center text-xs">
        <div className="container-cce py-2">
          Entrega grátis nas áreas urbanas de Espigão e Quedas do Iguaçu ·{" "}
          <Link to="/" hash="faq" className="text-gold underline-offset-2 hover:underline">
            ver condições
          </Link>
        </div>
      </div>

      <SiteHeader logoUrl={settings?.logo_url} />

      <main>
        <section className="container-cce grid items-center gap-8 py-10 lg:grid-cols-2 lg:py-16">
          <div>
            <p className="eyebrow">{settings?.hero_overline ?? "CCE IMPORTS • PERFUMES E CELULARES"}</p>
            <h1 className="font-display mt-3 text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">
              {settings?.hero_title ?? "Seu próximo perfume. Seu novo celular."}
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              {settings?.hero_description ??
                "Explore nossa seleção, compare as opções e escolha com atendimento próximo pelo WhatsApp."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className={btnGold}
                to="/"
                search={{ categoria: "perfumes" }}
                hash="catalogo"
              >
                Explorar perfumes
              </Link>
              <Link
                className={btnGhost}
                to="/"
                search={{ categoria: "celulares" }}
                hash="catalogo"
              >
                Ver celulares
              </Link>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Loja física em {STORE.city} • Retirada e entrega local
            </p>
          </div>
          <div className="surface-card overflow-hidden">
            <picture>
              <source
                media="(min-width: 1024px)"
                srcSet={settings?.hero_desktop_url ?? heroWide.url}
              />
              <img
                src={settings?.hero_mobile_url ?? heroSquare.url}
                alt="Perfumes Yara, Asad e Fakhar Lattafa lado a lado"
                width={1280}
                height={1280}
                className="h-full w-full object-cover"
              />
            </picture>
          </div>
        </section>

        <Benefits />
        <Catalog products={products} rules={rules} filters={filters} onChange={onChange} />
        <CustomOrder />
        <PerfumeHelp />
        <StoreInfo photoUrl={settings?.store_photo_url} />
        <Faq />
      </main>

      <SiteFooter logoUrl={settings?.logo_url} />
      <WhatsAppFab />

      <script
        type="application/ld+json"
        // Conteúdo estático e controlado, sem dados de usuário.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: STORE.name,
            telephone: STORE.whatsappDisplay,
            address: {
              "@type": "PostalAddress",
              streetAddress: "Avenida Brasília, 430",
              addressLocality: STORE.city,
              addressRegion: STORE.state,
              addressCountry: "BR",
            },
            description: FULL_ADDRESS,
            sameAs: [STORE.instagramUrl],
            openingHoursSpecification: [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                opens: "08:00",
                closes: "11:30",
              },
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                opens: "13:00",
                closes: "18:00",
              },
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Saturday"],
                opens: "08:00",
                closes: "12:00",
              },
            ],
          }),
        }}
      />
    </>
  );
}
