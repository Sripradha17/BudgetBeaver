import { describe, it, expect } from "vitest";
import { monthKey, monthLabel, shiftMonth, isSameMonth, startOfMonth, toInputDate, fromInputDate } from "./month.js";

describe("monthKey", () => {
  it("pads single-digit months", () => {
    expect(monthKey(new Date(2026, 0, 15))).toBe("2026-01");
    expect(monthKey(new Date(2026, 10, 1))).toBe("2026-11");
  });
});

describe("monthLabel", () => {
  it("formats as full month name and year", () => {
    expect(monthLabel(new Date(2026, 2, 1))).toBe("March 2026");
  });
});

describe("shiftMonth", () => {
  it("moves forward and backward across year boundaries", () => {
    expect(monthKey(shiftMonth(new Date(2026, 0, 15), 1))).toBe("2026-02");
    expect(monthKey(shiftMonth(new Date(2026, 0, 15), -1))).toBe("2025-12");
  });

  it("always lands on the 1st of the target month", () => {
    const shifted = shiftMonth(new Date(2026, 0, 31), 1);
    expect(shifted.getDate()).toBe(1);
  });
});

describe("isSameMonth", () => {
  it("is true for same year+month regardless of day", () => {
    expect(isSameMonth(new Date(2026, 3, 1), new Date(2026, 3, 28))).toBe(true);
  });

  it("is false across different months or years", () => {
    expect(isSameMonth(new Date(2026, 3, 1), new Date(2026, 4, 1))).toBe(false);
    expect(isSameMonth(new Date(2026, 3, 1), new Date(2025, 3, 1))).toBe(false);
  });
});

describe("startOfMonth", () => {
  it("returns the 1st at local midnight", () => {
    const s = startOfMonth(new Date(2026, 5, 17));
    expect(s.getDate()).toBe(1);
    expect(s.getMonth()).toBe(5);
  });
});

describe("toInputDate / fromInputDate", () => {
  it("round-trips a date through the input-string format", () => {
    const d = new Date(2026, 8, 5);
    expect(toInputDate(d)).toBe("2026-09-05");
    const parsed = fromInputDate("2026-09-05");
    expect(isSameMonth(parsed, d)).toBe(true);
    expect(parsed.getDate()).toBe(5);
  });

  it("fromInputDate never shifts a day due to UTC parsing", () => {
    const parsed = fromInputDate("2026-01-01");
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(0);
    expect(parsed.getDate()).toBe(1);
  });
});
