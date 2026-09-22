import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { btnGhost, btnSubtle, btnWhats } from "./buttons";
import { matchesQuery, type Product } from "@/lib/catalog";
import { pixPrice, type Category, type PaymentRules } from "@/lib/pricing";
import { waCustomOrderMessage, waLink } from "@/lib/store";

export type CatalogFilters = {
  categoria: Category;
  q: string;
  publico: "todos" | "masculino" | "feminino" | "unissex";
  marca: string;
  ordem: "destaques" | "menor" | "maior" | "nome";
};

export function Catalog({
  products,
  rules,
  filters,
  onChange,
}: {
  products: Product[];
  rules: Record<Category, PaymentRules>;
  filters: CatalogFilters;
  onChange: (next: Partial<CatalogFilters>) => void;
}) {
  const [drawer, setDrawer] = useState(false);
  const rule = rules[filters.categoria];

  const brands = useMemo(() => {
    const set = new Set<string>();
    products
      .filter((p) => p.category === filters.categoria && p.brand)
      .forEach((p) => set.add(p.brand as string));
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [products, filters.categoria]);

  const results = useMemo(() => {
    const list = products
      .filter((p) => p.category === filters.categoria)
      .filter((p) =>
        filters.publico === "todos" || filters.categoria !== "perfumes"
          ? true
          : p.gender === filters.publico,
      )
      .filter((p) => (filters.marca ? p.brand === filters.marca : true))
      .filter((p) => matchesQuery(p, filters.q));

    const byOrder = (a: Product, b: Product) => {
      if (filters.ordem === "menor")
        return pixPrice(a.base_price_cents, rule) - pixPrice(b.base_price_cents, rule);
      if (filters.ordem === "maior")
        return pixPrice(b.base_price_cents, rule) - pixPrice(a.base_price_cents, rule);
      if (filters.ordem === "nome") return a.name.localeCompare(b.name, "pt-BR");
      return (
        Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order
      );
    };

    return list.sort(
      (a, b) =>
        Number(a.availability === "sold_out") - Number(b.availability === "sold_out") ||
        byOrder(a, b),
    );
  }, [products, filters, rule]);

  const hasFilters =
    filters.q !== "" || filters.publico !== "todos" || filters.marca !== "" || filters.ordem !== "destaques";

  const clear = () => onChange({ q: "", publico: "todos", marca: "", ordem: "destaques" });

  const controls = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {filters.categoria === "perfumes" ? (
        <label className="text-sm">
          <span className="mb-1 block text-muted-foreground">Público</span>
          <select
            className="bg-elevated border-border min-h-11 w-full rounded-lg border px-3"
            value={filters.publico}
            onChange={(e) => onChange({ publico: e.target.value as CatalogFilters["publico"] })}
          >
            <option value="todos">Todos</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="unissex">Unissex</option>
          </select>
        </label>
      ) : null}
      <label className="text-sm">
        <span className="mb-1 block text-muted-foreground">Marca</span>
        <select
          className="bg-elevated border-border min-h-11 w-full rounded-lg border px-3"
          value={filters.marca}
          onChange={(e) => onChange({ marca: e.target.value })}
        >
          <option value="">Todas</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-muted-foreground">Ordenar</span>
        <select
          className="bg-elevated border-border min-h-11 w-full rounded-lg border px-3"
          value={filters.ordem}
          onChange={(e) => onChange({ ordem: e.target.value as CatalogFilters["ordem"] })}
        >
          <option value="destaques">Destaques</option>
          <option value="menor">Menor preço no Pix</option>
          <option value="maior">Maior preço no Pix</option>
          <option value="nome">Nome A–Z</option>
        </select>
      </label>
      {hasFilters ? (
        <div className="flex items-end">
          <button type="button" className={btnGhost} onClick={clear}>
            Limpar filtros
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <section id="catalogo" className="container-cce scroll-mt-20 py-14">
      <p className="eyebrow">Catálogo</p>
      <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">
        Encontre o seu próximo favorito
      </h2>
      <p className="mt-2 text-muted-foreground">
        Perfumes e celulares disponíveis na CCE Imports.
      </p>

      <div
        role="tablist"
        aria-label="Categorias"
        className="bg-elevated mt-6 inline-flex rounded-lg p-1"
      >
        {(["perfumes", "celulares"] as const).map((cat) => (
          <button
            key={cat}
            role="tab"
            type="button"
            aria-selected={filters.categoria === cat}
            className={`min-h-11 rounded-md px-5 text-sm font-medium capitalize ${
              filters.categoria === cat
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
            onClick={() => onChange({ categoria: cat, publico: "todos", marca: "" })}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Buscar produtos</span>
            <Search
              size={18}
              aria-hidden
              className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={filters.q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder="Buscar por nome, marca ou código"
              className="bg-elevated border-border min-h-11 w-full rounded-lg border pr-3 pl-10 text-sm"
            />
          </label>
          <button
            type="button"
            className={`${btnSubtle} lg:hidden`}
            aria-expanded={drawer}
            onClick={() => setDrawer((v) => !v)}
          >
            <SlidersHorizontal size={18} aria-hidden />
            Filtros
          </button>
        </div>

        <div className={drawer ? "block" : "hidden lg:block"}>{controls}</div>

        <p aria-live="polite" className="text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? "resultado" : "resultados"}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="surface-card mt-6 p-6 text-center">
          <p className="font-display text-lg font-semibold">
            Não encontramos produtos com esses filtros.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" className={btnGhost} onClick={clear}>
              Limpar filtros
            </button>
            <a
              className={btnWhats}
              target="_blank"
              rel="noopener noreferrer"
              href={waLink(
                waCustomOrderMessage(filters.categoria, filters.q || "produto não informado"),
              )}
            >
              Consultar encomenda
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} rules={rules[p.category]} />
          ))}
        </div>
      )}
    </section>
  );
}
