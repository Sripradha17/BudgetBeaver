import { describe, it, expect } from "vitest";
import { getRecurringTemplates, getMissingRecurringForMonth } from "./recurring.js";

describe("getRecurringTemplates", () => {
  it("ignores non-recurring expenses", () => {
    const expenses = [{ date: new Date(2026, 0, 1), note: "Netflix", isRecurring: false }];
    expect(getRecurringTemplates(expenses)).toEqual([]);
  });

  it("ignores recurring expenses with no note", () => {
    const expenses = [{ date: new Date(2026, 0, 1), note: "", isRecurring: true }];
    expect(getRecurringTemplates(expenses)).toEqual([]);
  });

  it("picks the most recent expense per normalized note as the template", () => {
    const older = { date: new Date(2026, 0, 1), note: "Netflix", amount: 12, isRecurring: true };
    const newer = { date: new Date(2026, 1, 1), note: "netflix!!", amount: 15, isRecurring: true };
    const templates = getRecurringTemplates([older, newer]);
    expect(templates).toHaveLength(1);
    expect(templates[0].amount).toBe(15);
  });
});

describe("getMissingRecurringForMonth", () => {
  const template = {
    date: new Date(2026, 0, 5),
    note: "Netflix",
    category: "subscriptions",
    amount: 15,
    person: "mine",
    isRecurring: true,
  };

  it("proposes a missing recurring expense for a later month not yet logged", () => {
    const missing = getMissingRecurringForMonth([template], "2026-02");
    expect(missing).toHaveLength(1);
    expect(missing[0].amount).toBe(15);
    expect(missing[0].category).toBe("subscriptions");
  });

  it("does not propose one for the template's own month or earlier", () => {
    expect(getMissingRecurringForMonth([template], "2026-01")).toHaveLength(0);
    expect(getMissingRecurringForMonth([template], "2025-12")).toHaveLength(0);
  });

  it("skips a month that already has a matching-note expense", () => {
    const already = { date: new Date(2026, 1, 5), note: "Netflix", category: "subscriptions", amount: 15, isRecurring: false };
    const missing = getMissingRecurringForMonth([template, already], "2026-02");
    expect(missing).toHaveLength(0);
  });

  it("clamps the day-of-month to the shorter target month", () => {
    const endOfMonthTemplate = { ...template, date: new Date(2026, 0, 31) };
    const missing = getMissingRecurringForMonth([endOfMonthTemplate], "2026-02");
    expect(missing[0].date.getDate()).toBe(28);
  });
});
