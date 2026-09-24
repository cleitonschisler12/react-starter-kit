# CCE Imports — site de catálogo

Site de catálogo de perfumes e celulares com pedidos pelo WhatsApp e painel administrativo
protegido. Não há carrinho, checkout, pagamento online nem cadastro de clientes.

## Páginas

- `/` — topo, benefícios, catálogo com busca e filtros, encomendas, ajuda para escolher, nossa loja e dúvidas
- `/produto/<slug>` — fotos, preço por forma de pagamento, simulação de crédito, ficha técnica e pedido no WhatsApp
- `/privacidade` — aviso de privacidade 
- `/admin/login` — acesso da equipe
- `/admin` — produtos e pendências; `/admin/produto/<id>` edição; `/admin/config` textos e imagens da home

## Preços

As regras ficam em `src/lib/pricing.ts` e nas regras de pagamento do banco:

- Perfumes: até 3x no crédito, 5% em 1x, 10% no débito, 15% no Pix ou dinheiro
- Celulares: até 12x no crédito, 10% até 5x, 15% no débito, 20% no Pix ou dinheiro

Descontos não são cumulativos. Testes: `bunx vitest run`.

## Como dar acesso ao primeiro administrador

1. Crie a conta em `/admin/login` (é preciso primeiro cadastrar o e-mail no backend de usuários).
2. No banco, adicione o papel de administrador para o usuário:
   `insert into user_roles (user_id, role) values ('<id-do-usuario>', 'admin');`

Sem esse papel, o painel mostra "Acesso restrito".

## Pendências do proprietário

Estão registradas no painel, em "Pendências do proprietário":

- Garantia oficial dos dois celulares (texto ainda não confirmado)
- Foto correta do D'Hermosa 1028 (a arte enviada mostra o código 1020)
- Fotos reais faltantes: produtos sem foto exibem "Foto em atualização"
- Marca do Mousuf Musk a confirmar
- Foto real da fachada da loja (a seção "Nossa loja" usa um espaço tipográfico até então)

## Hospedagem e domínio

O projeto é independente e não altera nada em `cceimports.com.br`. A ligação do domínio é feita
depois, pelo proprietário, nas configurações de publicação.
