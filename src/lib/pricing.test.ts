import { describe, expect, it } from "vitest";
import {
  DEFAULT_RULES,
  creditTotal,
  debitPrice,
  describePlan,
  installmentPlan,
  pixPrice,
} from "./pricing";

const perf = DEFAULT_RULES.perfumes;
const cel = DEFAULT_RULES.celulares;

describe("perfumes", () => {
  it("base R$ 40,00", () => {
    expect(creditTotal(4000, 1, perf)).toBe(3800);
    expect(debitPrice(4000, perf)).toBe(3600);
    expect(pixPrice(4000, perf)).toBe(3400);
    expect(creditTotal(4000, 3, perf)).toBe(4000);
  });
  it("base R$ 270,00", () => {
    expect(creditTotal(27000, 1, perf)).toBe(25650);
    expect(debitPrice(27000, perf)).toBe(24300);
    expect(pixPrice(27000, perf)).toBe(22950);
    expect(installmentPlan(27000, 3).each).toBe(9000);
  });
  it("fronteira 1/2/3 parcelas", () => {
    expect(creditTotal(27000, 1, perf)).toBe(25650);
    expect(creditTotal(27000, 2, perf)).toBe(27000);
    expect(creditTotal(27000, 3, perf)).toBe(27000);
    expect(creditTotal(27000, 9, perf)).toBe(27000);
  });
});

describe("celulares", () => {
  it("POCO base R$ 1.500,00", () => {
    expect(creditTotal(150000, 12, cel)).toBe(150000);
    expect(installmentPlan(150000, 12).each).toBe(12500);
    expect(creditTotal(150000, 5, cel)).toBe(135000);
    expect(installmentPlan(135000, 5).each).toBe(27000);
    expect(debitPrice(150000, cel)).toBe(127500);
    expect(pixPrice(150000, cel)).toBe(120000);
  });
  it("Redmi base R$ 1.600,00", () => {
    expect(creditTotal(160000, 12, cel)).toBe(160000);
    expect(creditTotal(160000, 5, cel)).toBe(144000);
    expect(installmentPlan(144000, 5).each).toBe(28800);
    expect(debitPrice(160000, cel)).toBe(136000);
    expect(pixPrice(160000, cel)).toBe(128000);
  });
  it("fronteira 5/6/12 parcelas", () => {
    expect(creditTotal(160000, 5, cel)).toBe(144000);
    expect(creditTotal(160000, 6, cel)).toBe(160000);
    expect(creditTotal(160000, 12, cel)).toBe(160000);
  });
});

describe("parcelas", () => {
  it("soma exatamente o total", () => {
    for (const total of [160000, 150000, 4000, 22950, 7500, 5000]) {
      for (let n = 1; n <= 12; n += 1) {
        const p = installmentPlan(total, n);
        expect(p.each * (n - 1) + p.last).toBe(total);
      }
    }
  });
  it("mostra centavos restantes", () => {
    // O formatador do navegador usa espaço não separável depois de "R$".
    expect(describePlan(160000, 12).replace(/\u00a0/g, " ")).toBe(
      "11x de R$ 133,33 + 1x de R$ 133,37 • total R$ 1.600,00",
    );
  });
  it("descontos não são cumulativos", () => {
    expect(pixPrice(creditTotal(160000, 1, cel), cel)).not.toBe(pixPrice(160000, cel));
    expect(pixPrice(160000, cel)).toBe(128000);
  });
});
