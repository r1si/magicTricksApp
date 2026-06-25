import { describe, it, expect } from "vitest";
import { methodSeconds, formatClock, methodClock } from "./clock";

const S = 1000; // 1 secondo in ms

describe("methodSeconds", () => {
  it("parte da 1 all'apertura e avanza di 1/s", () => {
    const start = 10_000;
    expect(methodSeconds(start, start)).toBe(1);
    expect(methodSeconds(start, start + 4 * S)).toBe(5);
  });

  it("cicla: 60 poi riparte da 1", () => {
    const start = 0;
    expect(methodSeconds(start, start + 59 * S)).toBe(60);
    expect(methodSeconds(start, start + 60 * S)).toBe(1);
    expect(methodSeconds(start, start + 61 * S)).toBe(2);
  });

  it("non va sotto 1 se now < start", () => {
    expect(methodSeconds(1000, 0)).toBe(1);
  });
});

describe("formatClock", () => {
  it("formatta HH:MM:SS con zero-padding", () => {
    expect(formatClock({ hh: 9, mm: 3, ss: 7 })).toBe("09:03:07");
  });
});

describe("methodClock", () => {
  it("usa ore/minuti reali e i secondi del contatore", () => {
    const now = new Date(2026, 5, 24, 14, 32, 0).getTime();
    const start = now - 4 * S; // 4s fa → contatore = 5
    const c = methodClock(start, now);
    expect(c.hh).toBe(14);
    expect(c.mm).toBe(32);
    expect(c.ss).toBe(5);
  });
});
