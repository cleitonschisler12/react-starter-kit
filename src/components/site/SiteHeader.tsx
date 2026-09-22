import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Brand } from "./Brand";
import { btnWhats } from "./buttons";
import { WA_GENERAL, waLink } from "@/lib/store";

const NAV = [
  { label: "Perfumes", to: "/", search: { categoria: "perfumes" }, hash: "catalogo" },
  { label: "Celulares", to: "/", search: { categoria: "celulares" }, hash: "catalogo" },
  { label: "Encomendas", to: "/", search: {}, hash: "encomendas" },
  { label: "Nossa loja", to: "/", search: {}, hash: "loja" },
] as const;

export function SiteHeader({ logoUrl }: { logoUrl?: string | null | undefined }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="border-border/80 bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="container-cce flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="CCE Imports — página inicial">
          <Brand logoUrl={logoUrl} />
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              search={item.search}
              hash={item.hash}
              className="hover:text-gold text-sm text-muted-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            className={`${btnWhats} hidden md:inline-flex`}
            href={waLink(WA_GENERAL)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Fale conosco
          </a>
          <button
            ref={triggerRef}
            type="button"
            className="border-border inline-flex h-11 w-11 items-center justify-center rounded-lg border md:hidden"
            aria-expanded={open}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      {open ? (
        <div ref={panelRef} className="border-border bg-card border-t md:hidden">
          <nav aria-label="Navegação móvel" className="container-cce flex flex-col py-2">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                search={item.search}
                hash={item.hash}
                onClick={() => setOpen(false)}
                className="border-border/60 min-h-11 border-b py-3 text-sm last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <a
              className={`${btnWhats} my-3`}
              href={waLink(WA_GENERAL)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              Fale conosco
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
