// Tipi condivisi della scena del mazzo.
import type { Card } from "@/lib/cards";

/**
 * Stato transiente del drag della carta attiva (no re-render: aggiornato in un
 * ref e letto nel loop di `useFrame`).
 * - `active`: il dito sta trascinando (oltre la soglia di movimento).
 * - `ndcX/ndcY`: posizione puntatore in Normalized Device Coordinates (-1..1),
 *   proiettata sul piano del tavolo dalla carta per "seguire il dito".
 * Quando `active` è false la carta attiva torna da sola in cima al mazzo.
 */
export type CardControl = {
  active: boolean;
  ndcX: number;
  ndcY: number;
};

export const initialCardControl = (): CardControl => ({
  active: false,
  ndcX: 0,
  ndcY: 0,
});

/** Posa corrente della carta attiva sul tavolo, scritta dalla scena ogni frame. */
export type CardXform = { x: number; z: number; rotZ: number };

export const initialCardXform = (): CardXform => ({ x: 0, z: 0, rotZ: 0 });

/**
 * Carta distribuita sul tavolo. Viene posata **a dorso** (come nel mazzo reale:
 * non ha identità finché non la giri). `revealed` passa a true quando la giri e
 * `face` è la faccia che mostra: la PRIMA girata è la carta del metodo
 * (`resolvedCard`), dalla seconda in poi una carta casuale distinta. La posa
 * (x/z/rotZ) è quella in cui l'hai lasciata sfilandola dal mazzo.
 */
export type DealtCard = {
  id: number;
  x: number;
  z: number;
  rotZ: number;
  revealed: boolean;
  face: Card | null;
};
