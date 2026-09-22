import { useState } from "react";
import { MapPin, Store, Truck, CreditCard, MessageCircle } from "lucide-react";
import { btnGhost, btnGold, btnWhats } from "./buttons";
import {
  FULL_ADDRESS,
  MAPS_URL,
  STORE,
  WA_GENERAL,
  WA_HELP,
  waCustomOrderMessage,
  waLink,
} from "@/lib/store";

export function Benefits() {
  const items = [
    { icon: Store, title: "Retire na loja", note: "Combine pelo WhatsApp" },
    {
      icon: Truck,
      title: "Entrega local gratuita",
      note: "Áreas urbanas de Espigão e Quedas do Iguaçu",
    },
    { icon: CreditCard, title: "Condições de pagamento", note: "Consulte as opções de cada produto" },
    { icon: MessageCircle, title: "Atendimento pelo WhatsApp", note: STORE.whatsappDisplay },
  ];
  return (
    <section className="border-border/70 border-y">
      <div className="container-cce grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <item.icon size={20} className="text-gold mt-0.5 shrink-0" aria-hidden />
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CustomOrder() {
  const [category, setCategory] = useState("Perfume");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) {
      setError("Conte qual produto você procura para continuar.");
      return;
    }
    setError("");
    window.open(waLink(waCustomOrderMessage(category, value)), "_blank", "noopener,noreferrer");
  };

  return (
    <section id="encomendas" className="container-cce scroll-mt-20 py-14">
      <div className="surface-card p-6 lg:p-10">
        <p className="eyebrow">Encomendas</p>
        <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">
          Não encontrou o que procura?
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Consulte a possibilidade de encomendar perfumes e celulares. A gente verifica
          disponibilidade, valor e prazo antes de combinar o pedido.
        </p>
        <form className="mt-6 grid gap-3 sm:grid-cols-[160px_1fr_auto]" onSubmit={submit}>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Categoria</span>
            <select
              className="bg-elevated border-border min-h-11 w-full rounded-lg border px-3"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Perfume">Perfume</option>
              <option value="Celular">Celular</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Qual produto você procura?</span>
            <input
              value={text}
              maxLength={120}
              onChange={(e) => setText(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "encomenda-erro" : undefined}
              className="bg-elevated border-border min-h-11 w-full rounded-lg border px-3"
              placeholder="Ex.: perfume amadeirado 100 mL"
            />
          </label>
          <div className="flex items-end">
            <button type="submit" className={btnGold}>
              Consultar encomenda
            </button>
          </div>
        </form>
        {error ? (
          <p id="encomenda-erro" className="text-destructive mt-2 text-sm">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function PerfumeHelp() {
  return (
    <section className="container-cce py-4">
      <div className="surface-card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Em dúvida entre os perfumes?</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Conte quais aromas você gosta e para qual ocasião procura. A gente ajuda você a comparar
            as opções.
          </p>
        </div>
        <a className={btnWhats} href={waLink(WA_HELP)} target="_blank" rel="noopener noreferrer">
          Quero ajuda para escolher
        </a>
      </div>
    </section>
  );
}

export function StoreInfo({ photoUrl }: { photoUrl?: string | null | undefined }) {
  return (
    <section id="loja" className="container-cce scroll-mt-20 py-14">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Nossa loja</p>
          <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">
            Atendimento próximo, também na loja física
          </h2>
          <p className="mt-4 flex items-start gap-2 text-muted-foreground">
            <MapPin size={18} className="text-gold mt-0.5 shrink-0" aria-hidden />
            {FULL_ADDRESS}
          </p>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between border-border/70 border-b py-2">
              <dt className="text-muted-foreground">Segunda a sexta</dt>
              <dd>{STORE.hours.weekdays}</dd>
            </div>
            <div className="flex justify-between border-border/70 border-b py-2">
              <dt className="text-muted-foreground">Sábado</dt>
              <dd>{STORE.hours.saturday}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <a className={btnGhost} href={MAPS_URL} target="_blank" rel="noopener noreferrer">
              Como chegar
            </a>
            <a
              className={btnWhats}
              href={waLink(WA_GENERAL)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Conversar no WhatsApp
            </a>
          </div>
        </div>
        <div className="surface-card aspect-[3/2] min-w-0 overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Prateleiras iluminadas da loja CCE Imports com perfumes e celulares expostos"
              width={1536}
              height={1024}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <p className="font-display text-gold text-2xl font-semibold tracking-wide">
                CCE IMPORTS
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Avenida Brasília, 430 — Centro
                <br />
                Espigão Alto do Iguaçu — PR
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
