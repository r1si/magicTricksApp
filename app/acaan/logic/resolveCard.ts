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
 * VALORE dai secondi dell'orologio (0..59), mappatura ciclica a blocchi di 20:
 *   blocco = secondi mod 20 →
 *     0      → carta BIANCA (lo zero del ciclo: 00 / 20 / 40)
 *     1–13   → Asso..Re
 *     14–19  → Jolly
 */
export function valueFromSeconds(sec: number): CardValue {
  const block = ((sec % 20) + 20) % 20; // 0..19 (robusto su input negativi)
  if (block === 0) return "blank";
  return block <= 13 ? block : "joker";
}

/** Carta risolta = seme (dal quadrante) + valore (dai secondi). */
export function resolveCard(suit: Suit, seconds: number): Card {
  return { suit, value: valueFromSeconds(seconds) };
}
