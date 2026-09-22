import { Link } from "@tanstack/react-router";
import { primaryImage, productDetail, type Product } from "@/lib/catalog";
import {
  creditTotal,
  formatBRL,
  installmentPlan,
  pixPrice,
  type PaymentRules,
} from "@/lib/pricing";

export function ProductCard({ product, rules }: { product: Product; rules: PaymentRules }) {
  const image = primaryImage(product);
  const detail = productDetail(product);
  const pix = pixPrice(product.base_price_cents, rules);
  const maxTotal = creditTotal(product.base_price_cents, rules.max_installments, rules);
  const maxPlan = installmentPlan(maxTotal, rules.max_installments);
  const soldOut = product.availability === "sold_out";

  return (
    <article className="surface-card group flex h-full flex-col overflow-hidden">
      <Link
        to="/produto/$slug"
        params={{ slug: product.slug }}
        className="focus-visible:outline-ring block focus-visible:outline-2"
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <div className="bg-elevated/60 relative aspect-square">
          {image ? (
            <img
              src={image.url}
              alt={image.alt_text ?? product.name}
              width={600}
              height={600}
              loading="lazy"
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
              Foto em atualização
            </div>
          )}
          <span
            className={`absolute top-2 left-2 rounded-full px-2 py-1 text-[11px] font-medium ${
              soldOut ? "bg-elevated text-muted-foreground" : "bg-whats/15 text-whats"
            }`}
          >
            {soldOut ? "Esgotado" : "Disponível"}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
            {product.brand ?? (product.category === "perfumes" ? "Perfume" : "Celular")}
            {detail ? ` • ${detail}` : ""}
          </p>
          <h3 className="font-display mt-1 text-sm leading-snug font-semibold break-words">
            {product.name}
          </h3>
        </div>
        {product.short_description ? (
          <p className="line-clamp-2 text-xs text-muted-foreground">{product.short_description}</p>
        ) : null}

        <div className="mt-auto pt-1">
          <p className="font-display text-gold text-base font-semibold">
            {formatBRL(pix)} <span className="text-xs font-normal">no Pix ou dinheiro</span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {maxPlan.hasRemainder
              ? `Até ${rules.max_installments}x no crédito • total ${formatBRL(maxTotal)}`
              : `${rules.max_installments}x de ${formatBRL(maxPlan.each)} no crédito • total ${formatBRL(maxTotal)}`}
          </p>
          <Link
            to="/produto/$slug"
            params={{ slug: product.slug }}
            className="border-border hover:bg-accent focus-visible:outline-ring mt-3 flex min-h-11 items-center justify-center rounded-lg border text-sm font-medium focus-visible:outline-2"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
