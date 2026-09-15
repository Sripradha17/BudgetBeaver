import { describe, it, expect } from "vitest";
import { buildInsights } from "./insights.js";

const categories = [
  { id: "groceries", label: "Groceries" },
  { id: "dining", label: "Dining" },
  { id: "rent", label: "Rent" },
];

function expense(date, category, amount) {
  return { date, category, amount };
}

describe("buildInsights", () => {
  it("flags a category that rose more than 15% since last month", () => {
    const expenses = [
      expense("2026-01-10", "dining", 100),
      expense("2026-02-10", "dining", 150),
    ];
    const result = buildInsights(expenses, categories, "2026-02");
    const dining = result.changes.find((c) => c.id === "dining");
    expect(dining).toBeTruthy();
    expect(dining.kind).toBe("up");
    expect(dining.pct).toBeCloseTo(50, 5);
  });

  it("flags a category that dropped more than 15%", () => {
    const expenses = [
      expense("2026-01-10", "groceries", 200),
      expense("2026-02-10", "groceries", 100),
    ];
    const result = buildInsights(expenses, categories, "2026-02");
    const groceries = result.changes.find((c) => c.id === "groceries");
    expect(groceries.kind).toBe("down");
    expect(groceries.pct).toBeCloseTo(-50, 5);
  });

  it("ignores changes under the 15% threshold", () => {
    const expenses = [
      expense("2026-01-10", "rent", 1000),
      expense("2026-02-10", "rent", 1050),
    ];
    const result = buildInsights(expenses, categories, "2026-02");
    expect(result.changes.find((c) => c.id === "rent")).toBeUndefined();
  });

  it("ignores near-zero noise when both months are under $5", () => {
    const expenses = [
      expense("2026-01-10", "dining", 2),
      expense("2026-02-10", "dining", 4),
    ];
    const result = buildInsights(expenses, categories, "2026-02");
    expect(result.changes.find((c) => c.id === "dining")).toBeUndefined();
  });

  it("marks a category with no prior-month spend as new", () => {
    const expenses = [expense("2026-02-10", "dining", 40)];
    const result = buildInsights(expenses, categories, "2026-02");
    const dining = result.changes.find((c) => c.id === "dining");
    expect(dining.kind).toBe("new");
    expect(dining.pct).toBeNull();
    expect(dining.delta).toBe(40);
  });

  it("caps changes to the top 3 by absolute delta", () => {
    const expenses = [
      expense("2026-02-10", "dining", 40),
      expense("2026-02-10", "groceries", 60),
      expense("2026-02-10", "rent", 30),
    ];
    const result = buildInsights(expenses, categories, "2026-02");
    expect(result.changes.length).toBeLessThanOrEqual(3);
    expect(result.changes[0].id).toBe("groceries");
  });

  it("reports hasPrevData=false and null totalPct when there's no prior month", () => {
    const expenses = [expense("2026-02-10", "dining", 40)];
    const result = buildInsights(expenses, categories, "2026-02");
    expect(result.hasPrevData).toBe(false);
    expect(result.totalPct).toBeNull();
    expect(result.totalNow).toBe(40);
  });

  it("computes prevMonthKey across a year boundary", () => {
    const expenses = [
      expense("2025-12-10", "dining", 100),
      expense("2026-01-10", "dining", 200),
    ];
    const result = buildInsights(expenses, categories, "2026-01");
    expect(result.hasPrevData).toBe(true);
    expect(result.totalPrev).toBe(100);
  });
});
