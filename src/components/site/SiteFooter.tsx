import { Link } from "@tanstack/react-router";
import { Brand } from "./Brand";
import { FULL_ADDRESS, STORE, WA_GENERAL, waLink } from "@/lib/store";

export function SiteFooter({ logoUrl }: { logoUrl?: string | null | undefined }) {
  return (
    <footer className="border-border bg-card/60 mt-16 border-t">
      <div className="container-cce grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Brand logoUrl={logoUrl} />
          <p className="mt-3 text-sm text-muted-foreground">
            Perfumes e celulares com atendimento em Espigão Alto do Iguaçu.
          </p>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold">Loja</h2>
          <p className="mt-3 text-sm text-muted-foreground">{FULL_ADDRESS}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Seg a sex: {STORE.hours.weekdays}
            <br />
            Sábado: {STORE.hours.saturday}
          </p>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold">Contato</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a
                className="hover:text-gold"
                href={waLink(WA_GENERAL)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp {STORE.whatsappDisplay}
              </a>
            </li>
            <li>
              <a
                className="hover:text-gold"
                href={STORE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram {STORE.instagram}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold">Navegação</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link className="hover:text-gold" to="/" search={{ categoria: "perfumes" }} hash="catalogo">
                Perfumes
              </Link>
            </li>
            <li>
              <Link className="hover:text-gold" to="/" search={{ categoria: "celulares" }} hash="catalogo">
                Celulares
              </Link>
            </li>
            <li>
              <Link className="hover:text-gold" to="/" hash="encomendas">
                Encomendas
              </Link>
            </li>
            <li>
              <Link className="hover:text-gold" to="/privacidade">
                Aviso de privacidade
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-border border-t">
        <div className="container-cce flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()} {STORE.name}
          </span>
          <Link to="/admin/login" className="hover:text-gold opacity-70">
            Área administrativa
          </Link>
        </div>
      </div>
    </footer>
  );
}
