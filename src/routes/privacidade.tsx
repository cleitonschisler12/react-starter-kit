import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { STORE, WA_GENERAL, waLink } from "@/lib/store";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Aviso de privacidade | CCE Imports" },
      {
        name: "description",
        content:
          "Como a CCE Imports trata informações no site: navegação no catálogo, links para WhatsApp, Instagram e Maps, e acesso restrito de administradores.",
      },
      { property: "og:title", content: "Aviso de privacidade | CCE Imports" },
      {
        property: "og:description",
        content: "Aviso de privacidade do site de catálogo da CCE Imports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <>
      <SiteHeader />
      <main className="container-cce max-w-3xl py-12">
        <h1 className="font-display text-3xl font-semibold">Aviso de privacidade</h1>
        <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            Este site é um catálogo da CCE Imports. Ele não possui carrinho, checkout, pagamento
            online nem cadastro de clientes.
          </p>
          <h2 className="font-display text-foreground text-lg font-semibold">
            O que acontece quando você navega
          </h2>
          <p>
            As páginas de produtos e o catálogo são carregados a partir do banco de dados da loja.
            Não usamos ferramentas de publicidade, pixel de rastreamento ou analytics de terceiros
            neste site.
          </p>
          <h2 className="font-display text-foreground text-lg font-semibold">
            Links para WhatsApp, Instagram e Maps
          </h2>
          <p>
            Os botões de contato apenas abrem o WhatsApp, o Instagram ou o Google Maps com uma
            mensagem ou endereço já preenchidos. Nada é enviado automaticamente: você decide se envia
            a mensagem. A partir do momento em que a conversa começa, valem as políticas do
            aplicativo utilizado.
          </p>
          <h2 className="font-display text-foreground text-lg font-semibold">
            Formulário de encomenda
          </h2>
          <p>
            O campo de encomenda monta a mensagem no seu próprio navegador e abre o WhatsApp. O texto
            informado não é armazenado neste site.
          </p>
          <h2 className="font-display text-foreground text-lg font-semibold">Área administrativa</h2>
          <p>
            Existe um acesso restrito, com e-mail e senha, usado apenas pela loja para atualizar
            produtos, fotos e configurações. Ele não é aberto ao público.
          </p>
          <h2 className="font-display text-foreground text-lg font-semibold">Contato</h2>
          <p>
            Para qualquer questão de privacidade, fale com a loja pelo WhatsApp{" "}
            <a
              className="text-gold"
              href={waLink(WA_GENERAL)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {STORE.whatsappDisplay}
            </a>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
