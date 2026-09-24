export const STORE = {
  name: "CCE Imports",
  whatsapp: "5546999864663",
  whatsappDisplay: "+55 46 99986-4663",
  instagram: "@cceimports.oficial",
  instagramUrl: "https://www.instagram.com/cceimports.oficial/",
  addressLine: "Avenida Brasília, 430, Centro",
  city: "Espigão Alto do Iguaçu",
  state: "PR",
  hours: {
    weekdays: "08h às 11h30 e 13h às 18h",
    saturday: "08h às 12h",
  },
} as const;

export const FULL_ADDRESS = `${STORE.addressLine}, ${STORE.city} — ${STORE.state}`;

export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(FULL_ADDRESS)}`;

export function waLink(message: string): string {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const WA_GENERAL = "Olá! Vim pelo site da CCE Imports e gostaria de atendimento.";
export const WA_HELP =
  "Olá! Vim pelo site da CCE Imports e gostaria de ajuda para escolher um perfume.";

export function waOrderMessage(opts: {
  name: string;
  detail?: string | null;
  payment?: string | null;
  total?: string | null;
  installments?: string | null;
  url: string;
}): string {
  const lines: string[] = [];
  lines.push(
    `Olá! Vim pelo site da CCE Imports e tenho interesse em ${opts.name}${opts.detail ? `, ${opts.detail}` : ""}.`,
  );
  lines.push(`Forma de pagamento: ${opts.payment ?? "a combinar"}.`);
  if (opts.total) {
    lines.push(
      `Total do produto: ${opts.total}.${opts.installments ? ` Parcelamento: ${opts.installments}.` : ""}`,
    );
  }
  lines.push("Gostaria de confirmar a disponibilidade e combinar entrega ou retirada.");
  lines.push(`Produto: ${opts.url}`);
  return lines.join("\n");
}

export function waRestockMessage(name: string, url: string): string {
  return `Olá! Vi o produto ${name} no site da CCE Imports e gostaria de consultar a reposição. ${url}`;
}

export function waCustomOrderMessage(category: string, product: string): string {
  return `Olá! Vim pelo site da CCE Imports e gostaria de consultar uma encomenda de ${category}: ${product}. Podem verificar disponibilidade, valor e prazo?`;
}

/** Endereço público completo do produto, usado nas mensagens do WhatsApp. */
export function publicProductUrl(slug: string, origin?: string | null): string {
  return `${resolveSiteOrigin(origin)}/produto/${slug}`;
}
