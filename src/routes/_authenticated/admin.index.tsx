import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listAdminProducts, toggleAdminNote } from "@/lib/admin.functions";
import { formatBRL } from "@/lib/pricing";
import { btnGhost, btnGold, btnSubtle } from "@/components/site/buttons";
import { Brand } from "@/components/site/Brand";
import { primaryImage, productDetail } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Painel administrativo | CCE Imports" },
      { name: "description", content: "Gestão de produtos, fotos e configurações da loja." },
      { property: "og:title", content: "Painel administrativo | CCE Imports" },
      { property: "og:description", content: "Gestão interna da CCE Imports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  loader: () => listAdminProducts(),
  errorComponent: () => (
    <main className="container-cce py-12">
      <h1 className="font-display text-xl font-semibold">Acesso restrito</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Esta conta não tem permissão de administrador. Fale com o proprietário da loja.
      </p>
    </main>
  ),
  component: AdminHome,
});

function AdminHome() {
  const { products, notes } = Route.useLoaderData();
  const navigate = useNavigate();
  const router = Route.useRouteContext();
  const toggleNote = useServerFn(toggleAdminNote);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  void router;

  const visible = products.filter((p) =>
    (p.name + " " + (p.brand ?? "")).toLowerCase().includes(filter.toLowerCase()),
  );

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <main className="container-cce py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Brand />
        <div className="flex flex-wrap gap-2">
          <Link className={btnSubtle} to="/admin/config">
            Configurações
          </Link>
          <Link className={btnGhost} to="/">
            Ver site
          </Link>
          <button type="button" className={btnGhost} onClick={signOut}>
            Sair
          </button>
        </div>
      </header>

      {notes.length > 0 && (
        <section className="surface-card mt-8 p-5">
          <h2 className="font-display text-lg font-semibold">Pendências do proprietário</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {notes.map((note: any) => (
              <li key={note.id} className="flex flex-wrap items-start justify-between gap-3">
                <div className={note.resolved ? "text-muted-foreground line-through" : ""}>
                  <p className="font-medium">{note.title}</p>
                  {note.body && <p className="text-muted-foreground">{note.body}</p>}
                </div>
                <button
                  type="button"
                  className={btnSubtle}
                  disabled={busy === note.id}
                  onClick={async () => {
                    setBusy(note.id);
                    await toggleNote({ data: { id: note.id, resolved: !note.resolved } });
                    setBusy(null);
                    window.location.reload();
                  }}
                >
                  {note.resolved ? "Reabrir" : "Marcar resolvida"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">
            Produtos <span className="text-muted-foreground">({products.length})</span>
          </h2>
          <label className="text-sm">
            <span className="sr-only">Buscar produto</span>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar por nome ou marca"
              className="w-64 rounded-md border border-border bg-elevated px-3 py-2 text-sm"
            />
          </label>
        </div>

        <ul className="mt-4 divide-y divide-border">
          {visible.map((p) => {
            const img = primaryImage(p);
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-4 py-3">
                <div className="bg-elevated flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md">
                  {img ? (
                    <img src={img.url} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">sem foto</span>
                  )}
                </div>
                <div className="min-w-48 flex-1">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.brand ?? "—"} • {productDetail(p) ?? p.category} •{" "}
                    {formatBRL(p.base_price_cents)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-elevated rounded-full px-2 py-1">
                    {p.availability === "sold_out" ? "Esgotado" : "Disponível"}
                  </span>
                  <span className="bg-elevated rounded-full px-2 py-1">
                    {p.published ? "Publicado" : "Oculto"}
                  </span>
                  <Link className={btnGold} to="/admin/produto/$id" params={{ id: p.id }}>
                    Editar
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
        {visible.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">Nenhum produto encontrado.</p>
        )}
      </section>
    </main>
  );
}
