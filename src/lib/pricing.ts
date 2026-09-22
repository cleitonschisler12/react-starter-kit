export type Category = "perfumes" | "celulares";

export type PaymentRules = {
  category: Category;
  max_installments: number;
  /** Máximo de parcelas que ainda recebem desconto de crédito */
  discount_installments_max: number;
  discount_installments_pct: number;
  debit_pct: number;
  pix_pct: number;
};

export const DEFAULT_RULES: Record<Category, PaymentRules> = {
  perfumes: {
    category: "perfumes",
    max_installments: 3,
    discount_installments_max: 1,
    discount_installments_pct: 5,
    debit_pct: 10,
    pix_pct: 15,
  },
  celulares: {
    category: "celulares",
    max_installments: 12,
    discount_installments_max: 5,
    discount_installments_pct: 10,
    debit_pct: 15,
    pix_pct: 20,
  },
};

/** Aplica um desconto percentual sobre centavos, arredondando uma única vez. */
export function applyDiscount(baseCents: number, pct: number): number {
  return Math.round((baseCents * (100 - pct)) / 100);
}

export function pixPrice(baseCents: number, rules: PaymentRules): number {
  return applyDiscount(baseCents, rules.pix_pct);
}

export function debitPrice(baseCents: number, rules: PaymentRules): number {
  return applyDiscount(baseCents, rules.debit_pct);
}

/** Total no crédito para uma quantidade de parcelas. */
export function creditTotal(baseCents: number, installments: number, rules: PaymentRules): number {
  const n = Math.min(Math.max(1, Math.trunc(installments)), rules.max_installments);
  if (n <= rules.discount_installments_max) {
    return applyDiscount(baseCents, rules.discount_installments_pct);
  }
  return baseCents;
}

export type InstallmentPlan = {
  installments: number;
  total: number;
  /** Valor das primeiras parcelas */
  each: number;
  /** Valor da última parcela (recebe os centavos restantes) */
  last: number;
  hasRemainder: boolean;
};

export function installmentPlan(totalCents: number, installments: number): InstallmentPlan {
  const n = Math.max(1, Math.trunc(installments));
  const each = Math.floor(totalCents / n);
  const last = totalCents - each * (n - 1);
  return { installments: n, total: totalCents, each, last, hasRemainder: last !== each };
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(cents: number): string {
  return brl.format(cents / 100);
}

export function describePlan(totalCents: number, installments: number): string {
  const plan = installmentPlan(totalCents, installments);
  if (plan.installments === 1) return `1x de ${formatBRL(plan.total)}`;
  if (!plan.hasRemainder) {
    return `${plan.installments}x de ${formatBRL(plan.each)} • total ${formatBRL(plan.total)}`;
  }
  return `${plan.installments - 1}x de ${formatBRL(plan.each)} + 1x de ${formatBRL(plan.last)} • total ${formatBRL(plan.total)}`;
}

export type PaymentTableRow = { label: string; value: number; note?: string };

export function paymentTable(baseCents: number, rules: PaymentRules): PaymentTableRow[] {
  const rows: PaymentTableRow[] = [
    { label: "Pix ou dinheiro", value: pixPrice(baseCents, rules) },
    { label: "Débito", value: debitPrice(baseCents, rules) },
  ];
  const disc = creditTotal(baseCents, 1, rules);
  rows.push({
    label: `Crédito em até ${rules.discount_installments_max}x`,
    value: disc,
    note: describePlan(disc, rules.discount_installments_max),
  });
  if (rules.max_installments > rules.discount_installments_max) {
    rows.push({
      label: `Crédito em até ${rules.max_installments}x`,
      value: baseCents,
      note: describePlan(baseCents, rules.max_installments),
    });
  }
  return rows;
}
