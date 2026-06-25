import { describe, it, expect } from "vitest";
import { suitFromQuadrant, valueFromSeconds, resolveCard } from "./resolveCard";

describe("suitFromQuadrant", () => {
  const W = 100;
  const H = 100;
  it("mappa i 4 quadranti ai semi corretti", () => {
    expect(suitFromQuadrant(10, 10, W, H)).toBe("hearts"); // alto-sx
    expect(suitFromQuadrant(90, 10, W, H)).toBe("diamonds"); // alto-dx
    expect(suitFromQuadrant(10, 90, W, H)).toBe("clubs"); // basso-sx
    expect(suitFromQuadrant(90, 90, W, H)).toBe("spades"); // basso-dx
  });

  it("sul confine esatto (metà) considera destra/basso", () => {
    expect(suitFromQuadrant(50, 50, W, H)).toBe("spades");
    expect(suitFromQuadrant(49.9, 49.9, W, H)).toBe("hearts");
  });
});

describe("valueFromSeconds", () => {
  it("blocco 1: 1–13 = Asso..Re, 14–20 = jolly", () => {
    expect(valueFromSeconds(1)).toBe(1);
    expect(valueFromSeconds(13)).toBe(13);
    expect(valueFromSeconds(14)).toBe("joker");
    expect(valueFromSeconds(20)).toBe("joker");
  });

  it("blocco 2: 21–33 = Asso..Re, 34–40 = jolly", () => {
    expect(valueFromSeconds(21)).toBe(1);
    expect(valueFromSeconds(33)).toBe(13);
    expect(valueFromSeconds(34)).toBe("joker");
    expect(valueFromSeconds(40)).toBe("joker");
  });

  it("blocco 3: 41–53 = Asso..Re, 54–60 = jolly", () => {
    expect(valueFromSeconds(41)).toBe(1);
    expect(valueFromSeconds(53)).toBe(13);
    expect(valueFromSeconds(54)).toBe("joker");
    expect(valueFromSeconds(60)).toBe("joker");
  });
});

describe("resolveCard", () => {
  it("esempio specs: alto-sx (♥) + secondi 5 → 5 di Cuori", () => {
    const suit = suitFromQuadrant(10, 10, 100, 100);
    expect(resolveCard(suit, 5)).toEqual({ suit: "hearts", value: 5 });
  });

  it("propaga il jolly", () => {
    expect(resolveCard("spades", 14)).toEqual({
      suit: "spades",
      value: "joker",
    });
  });
});
