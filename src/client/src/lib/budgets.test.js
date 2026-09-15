import { describe, it, expect } from "vitest";
import { oneTimeBudgetKey, getEffectiveBudget, isOneTimeBudget } from "./budgets.js";

describe("oneTimeBudgetKey", () => {
  it("joins monthKey and categoryId with a colon", () => {
    expect(oneTimeBudgetKey("2026-02", "dining")).toBe("2026-02:dining");
  });
});

describe("getEffectiveBudget", () => {
  it("returns the recurring budget when no one-time override exists", () => {
    const settings = { budgets: { dining: 200 }, oneTimeBudgets: {} };
    expect(getEffectiveBudget(settings, "dining", "2026-02")).toBe(200);
  });

  it("prefers a one-time override for that month", () => {
    const settings = {
      budgets: { dining: 200 },
      oneTimeBudgets: { "2026-02:dining": 350 },
    };
    expect(getEffectiveBudget(settings, "dining", "2026-02")).toBe(350);
  });

  it("does not apply a one-time override to a different month", () => {
    const settings = {
      budgets: { dining: 200 },
      oneTimeBudgets: { "2026-02:dining": 350 },
    };
    expect(getEffectiveBudget(settings, "dining", "2026-03")).toBe(200);
  });

  it("defaults to 0 when no budget is set at all", () => {
    const settings = { budgets: {}, oneTimeBudgets: {} };
    expect(getEffectiveBudget(settings, "dining", "2026-02")).toBe(0);
  });

  it("treats an explicit 0 one-time override as set, not falling back", () => {
    const settings = { budgets: { dining: 200 }, oneTimeBudgets: { "2026-02:dining": 0 } };
    expect(getEffectiveBudget(settings, "dining", "2026-02")).toBe(0);
  });
});

describe("isOneTimeBudget", () => {
  it("is true only when a one-time override exists for that month", () => {
    const settings = { oneTimeBudgets: { "2026-02:dining": 100 } };
    expect(isOneTimeBudget(settings, "dining", "2026-02")).toBe(true);
    expect(isOneTimeBudget(settings, "dining", "2026-03")).toBe(false);
  });
});
