// Tipi dominio delle carte — fonte di verità condivisa (UI, logica, 3D).
// Nessuna dipendenza da React o three.js: resta importabile ovunque.

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

export const SUITS: readonly Suit[] = ["hearts", "diamonds", "clubs", "spades"];

/** Valore di una carta: 1..13 (Asso..Re) oppure un jolly. */
export type CardValue = number | "joker";

export type Card = { suit: Suit; value: CardValue };

export const isRedSuit = (s: Suit): boolean =>
  s === "hearts" || s === "diamonds";

const RANK_LABELS: Record<number, string> = {
  1: "A",
  11: "J",
  12: "Q",
  13: "K",
};

/** Etichetta breve del valore: "A", "2".."10", "J", "Q", "K" o "Jolly". */
export function valueLabel(value: CardValue): string {
  if (value === "joker") return "Jolly";
  return RANK_LABELS[value] ?? String(value);
}

const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

/** Etichetta leggibile della carta, es. "5♥" o "Jolly". */
export function cardLabel(card: Card): string {
  if (card.value === "joker") return "Jolly";
  return `${valueLabel(card.value)}${SUIT_SYMBOLS[card.suit]}`;
}
