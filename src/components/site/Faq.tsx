const ITEMS = [
  {
    q: "Como faço meu pedido?",
    a: "Escolha um produto e toque em ‘Pedir pelo WhatsApp’. Você conversa com a loja para confirmar disponibilidade, pagamento e entrega ou retirada.",
  },
  {
    q: "Quais são as formas de pagamento?",
    a: "Aceitamos crédito, débito, Pix e dinheiro. As condições de parcelamento e os descontos variam entre perfumes e celulares e aparecem na página de cada produto.",
  },
  {
    q: "A entrega é gratuita?",
    a: "A entrega é gratuita nas áreas urbanas de Espigão Alto do Iguaçu e Quedas do Iguaçu, mediante combinação com a loja. Para outras cidades, enviamos pelos Correios com frete e prazo consultados pelo CEP.",
  },
  {
    q: "Posso retirar na loja?",
    a: "Sim. Estamos na Avenida Brasília, 430, Centro, em Espigão Alto do Iguaçu. Combine a retirada pelo WhatsApp.",
  },
  {
    q: "Vocês fazem encomendas?",
    a: "Você pode consultar encomendas de perfumes e celulares pelo WhatsApp. Confirmamos a possibilidade, o valor e o prazo antes de fechar o pedido.",
  },
  {
    q: "Como escolher um perfume?",
    a: "Veja o perfil de aroma na página do produto. Se quiser ajuda, conte pelo WhatsApp quais fragrâncias você costuma usar e suas preferências.",
  },
  {
    q: "Como consultar troca ou garantia?",
    a: "Entre em contato pelo WhatsApp com os dados da compra e uma descrição do ocorrido. A loja orientará o atendimento conforme o produto e as condições aplicáveis.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="container-cce scroll-mt-20 py-14">
      <p className="eyebrow">Dúvidas</p>
      <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">Perguntas frequentes</h2>
      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {ITEMS.map((item) => (
          <details key={item.q} className="surface-card group p-4">
            <summary className="font-display cursor-pointer list-none text-sm font-semibold">
              {item.q}
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
