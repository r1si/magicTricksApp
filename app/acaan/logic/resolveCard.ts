// ⚠️ SEZIONE RISERVATA — metodo segreto del trucco ACAAN (vedi specs.md §4).
// Logica pura e deterministica: nessuna dipendenza da React o three.js.
import type { Suit, CardValue, Card } from "@/lib/cards";

/**
 * SEME dal quadrante del PRIMO swipe (coordinate schermo in pixel):
 *   alto-sx ♥  ·  alto-dx ♦  ·  basso-sx ♣  ·  basso-dx ♠
 */
export function suitFromQuadrant(
  x: number,
  y: number,
  w: number,
  h: number,
): Suit {
  const left = x < w / 2;
  const top = y < h / 2;
  if (top && left) return "hearts";
  if (top && !left) return "diamonds";
  if (!top && left) return "clubs";
  return "spades";
}

/**
 * VALORE dai secondi dell'orologio, mappatura ciclica a blocchi di 20:
 *   1–13 → Asso..Re · 14–20 → Jolly · poi il ciclo si ripete (21–33, 34–40, …).
 */
export function valueFromSeconds(sec: number): CardValue {
  const m = ((sec - 1) % 20) + 1; // normalizza nel blocco di 20 (1..20)
  return m <= 13 ? m : "joker";
}

/** Carta risolta = seme (dal quadrante) + valore (dai secondi). */
export function resolveCard(suit: Suit, seconds: number): Card {
  return { suit, value: valueFromSeconds(seconds) };
}
