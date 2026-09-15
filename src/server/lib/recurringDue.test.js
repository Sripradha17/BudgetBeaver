import { describe, it, expect } from "vitest";
import { normNote, getRecurringTemplates } from "./recurringDue.js";

describe("normNote", () => {
  it("lowercases, trims, and collapses punctuation to single spaces", () => {
    expect(normNote("  Netflix!!  ")).toBe("netflix");
    expect(normNote("Gym - Membership")).toBe("gym membership");
  });

  it("returns an empty string for null/undefined", () => {
    expect(normNote(null)).toBe("");
    expect(normNote(undefined)).toBe("");
  });
});

describe("getRecurringTemplates", () => {
  it("ignores non-recurring and note-less expenses", () => {
    const expenses = [
      { date: new Date(2026, 0, 1), note: "Netflix", isRecurring: false },
      { date: new Date(2026, 0, 1), note: "", isRecurring: true },
    ];
    expect(getRecurringTemplates(expenses)).toEqual([]);
  });

  it("keeps only the most recent expense per normalized note", () => {
    const older = { date: new Date(2026, 0, 1), note: "Rent", amount: 1000, isRecurring: true };
    const newer = { date: new Date(2026, 2, 1), note: "rent", amount: 1050, isRecurring: true };
    const templates = getRecurringTemplates([older, newer]);
    expect(templates).toHaveLength(1);
    expect(templates[0].amount).toBe(1050);
  });
});
