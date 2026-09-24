import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAdminSettings, updateAdminSettings, uploadAdminImage } from "@/lib/admin.functions";
import { fileToBase64 } from "@/lib/upload";
import { btnGhost, btnGold } from "@/components/site/buttons";

export const Route = createFileRoute("/_authenticated/admin/config")({
  head: () => ({
    meta: [
      { title: "Configurações da loja | CCE Imports" },
      { name: "description", content: "Ajuste textos da home, logo e imagens principais." },
      { property: "og:title", content: "Configurações da loja | CCE Imports" },
      { property: "og:description", content: "Configurações internas da CCE Imports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  loader: () => getAdminSettings(),
  errorComponent: () => (
    <main className="container-cce py-12">
      <h1 className="font-display text-xl font-semibold">Acesso restrito</h1>
    </main>
  ),
  component: AdminConfig,
});

const FIELDS: Array<[string, string, string]> = [
  ["hero_overline", "Linha de apoio do topo", "Texto curto acima do título"],
  ["hero_title", "Título da home", ""],
  ["hero_description", "Descrição da home", ""],
  ["logo_url", "Endereço da logo", "URL da imagem"],
  ["hero_desktop_url", "Imagem do topo (computador)", "URL da imagem"],
  ["hero_mobile_url", "Imagem do topo (celular)", "URL da imagem"],
  ["store_photo_url", "Foto da loja", "URL da imagem real da fachada"],
];

function AdminConfig() {
  const { settings } = Route.useLoaderData();
  const save = useServerFn(updateAdminSettings);
  const sendImage = useServerFn(uploadAdminImage);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(FIELDS.map(([key]) => [key, (settings as any)?.[key] ?? ""])),
  );
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("Salvando…");
    try {
      await save({ data: values });
      setStatus("Configurações salvas.");
    } catch {
      setStatus("Não foi possível salvar. Tente novamente.");
    }
  }

  return (
    <main className="container-cce max-w-2xl py-8">
      <Link className={btnGhost} to="/admin">
        Voltar ao painel
      </Link>
      <h1 className="font-display mt-6 text-2xl font-semibold">Configurações da loja</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Dados de contato, endereço e horários seguem os oficiais da loja e não são editáveis aqui.
      </p>

      <form onSubmit={onSubmit} className="surface-card mt-6 space-y-4 p-5">
        {FIELDS.map(([key, label, hint]) => (
          <div key={key}>
            <label htmlFor={key} className="block text-sm font-medium">
              {label}
            </label>
            {key === "hero_description" ? (
              <textarea
                id={key}
                rows={3}
                value={values[key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm"
              />
            ) : (
              <input
                id={key}
                value={values[key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm"
              />
            )}
            {key.endsWith("_url") && (
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                aria-label={`Enviar arquivo para ${label}`}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setStatus("Enviando imagem…");
                  try {
                    const base64 = await fileToBase64(file);
                    const { url } = await sendImage({
                      data: {
                        filename: file.name,
                        content_type: file.type,
                        data: base64,
                        folder: "loja",
                      },
                    });
                    setValues((v) => ({ ...v, [key]: url }));
                    setStatus("Imagem enviada. Clique em “Salvar” para aplicar no site.");
                  } catch {
                    setStatus("Não foi possível enviar a imagem. Use JPG, PNG ou WEBP até 10 MB.");
                  }
                }}
                className="mt-2 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm"
              />
            )}
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
        ))}
        <div className="flex items-center gap-3">
          <button type="submit" className={btnGold}>
            Salvar
          </button>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </div>
      </form>
    </main>
  );
}
