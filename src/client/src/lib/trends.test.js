import { describe, it, expect } from "vitest";
import { buildMonthlyTrends } from "./trends.js";

describe("buildMonthlyTrends", () => {
  it("returns one entry per month, oldest first, ending at endMonthDate", () => {
    const end = new Date(2026, 2, 15); // March 2026
    const result = buildMonthlyTrends([], [], end, 3);
    expect(result.map((r) => r.key)).toEqual(["2026-01", "2026-02", "2026-03"]);
  });

  it("sums income and expenses per month and computes balance", () => {
    const end = new Date(2026, 1, 1);
    const expenses = [
      { date: new Date(2026, 1, 5), category: "dining", amount: 40 },
      { date: new Date(2026, 1, 10), category: "groceries", amount: 60 },
    ];
    const income = [{ date: new Date(2026, 1, 1), amount: 300 }];
    const [feb] = buildMonthlyTrends(expenses, income, end, 1);
    expect(feb.income).toBe(300);
    expect(feb.expenses).toBe(100);
    expect(feb.balance).toBe(200);
  });

  it("carries forward cumulative savings/investment from before the window", () => {
    const end = new Date(2026, 2, 1); // March 2026, 1 month window -> only March shown
    const expenses = [
      { date: new Date(2026, 0, 1), category: "savings", amount: 500 }, // before window
      { date: new Date(2026, 2, 1), category: "savings", amount: 100 }, // in window
    ];
    const [march] = buildMonthlyTrends(expenses, [], end, 1);
    expect(march.savingsMonthly).toBe(100);
    expect(march.savingsCumulative).toBe(600);
  });

  it("accumulates savings/investment across months within the window", () => {
    const end = new Date(2026, 1, 1); // Jan + Feb
    const expenses = [
      { date: new Date(2026, 0, 5), category: "investment", amount: 50 },
      { date: new Date(2026, 1, 5), category: "investment", amount: 25 },
    ];
    const [jan, feb] = buildMonthlyTrends(expenses, [], end, 2);
    expect(jan.investmentCumulative).toBe(50);
    expect(feb.investmentCumulative).toBe(75);
  });

  it("returns zeros for months with no data", () => {
    const [only] = buildMonthlyTrends([], [], new Date(2026, 4, 1), 1);
    expect(only.income).toBe(0);
    expect(only.expenses).toBe(0);
    expect(only.balance).toBe(0);
  });
});
