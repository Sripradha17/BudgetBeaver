import { describe, it, expect } from "vitest";
import { expenseSignature, findDuplicateGroups } from "./duplicates.js";

describe("expenseSignature", () => {
  it("normalizes amount to the cent and note to lowercase/trimmed", () => {
    const a = expenseSignature(new Date(2026, 0, 5), 12.5, "  Coffee  ");
    const b = expenseSignature(new Date(2026, 0, 5), 12.5, "coffee");
    expect(a).toBe(b);
  });

  it("accepts a string amount", () => {
    const a = expenseSignature(new Date(2026, 0, 5), "12.50", "Coffee");
    const b = expenseSignature(new Date(2026, 0, 5), 12.5, "Coffee");
    expect(a).toBe(b);
  });

  it("differs when date, amount, or note differ", () => {
    const base = expenseSignature(new Date(2026, 0, 5), 10, "Lunch");
    expect(expenseSignature(new Date(2026, 0, 6), 10, "Lunch")).not.toBe(base);
    expect(expenseSignature(new Date(2026, 0, 5), 11, "Lunch")).not.toBe(base);
    expect(expenseSignature(new Date(2026, 0, 5), 10, "Dinner")).not.toBe(base);
  });
});

describe("findDuplicateGroups", () => {
  it("groups expenses that share date+amount+note, ignoring category/person", () => {
    const expenses = [
      { date: new Date(2026, 0, 5), amount: 20, note: "Groceries", category: "food", person: "mine" },
      { date: new Date(2026, 0, 5), amount: 20, note: "Groceries", category: "misc", person: "spouse" },
      { date: new Date(2026, 0, 6), amount: 20, note: "Groceries", category: "food", person: "mine" },
    ];
    const groups = findDuplicateGroups(expenses, []);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(2);
  });

  it("excludes groups whose signature is ignored", () => {
    const expenses = [
      { date: new Date(2026, 0, 5), amount: 20, note: "Groceries" },
      { date: new Date(2026, 0, 5), amount: 20, note: "Groceries" },
    ];
    const sig = expenseSignature(expenses[0].date, expenses[0].amount, expenses[0].note);
    expect(findDuplicateGroups(expenses, [sig])).toHaveLength(0);
    expect(findDuplicateGroups(expenses, new Set([sig]))).toHaveLength(0);
  });

  it("returns no groups when nothing repeats", () => {
    const expenses = [
      { date: new Date(2026, 0, 5), amount: 20, note: "Groceries" },
      { date: new Date(2026, 0, 6), amount: 30, note: "Gas" },
    ];
    expect(findDuplicateGroups(expenses, [])).toHaveLength(0);
  });
});
