import { create } from "zustand";
import type { Suit, Card } from "@/lib/cards";
import { suitFromQuadrant, resolveCard } from "../logic/resolveCard";

// Stato condiviso ACAAN (specs.md §6.6). La scena 3D NON conosce il metodo:
// legge solo `resolvedCard` al momento del flip.
type AcaanState = {
  /** Istante d'avvio del contatore dei secondi (epoch ms); null se non avviato. */
  startedAt: number | null;
  /** Seme fissato dal PRIMO swipe; resta invariato per tutta la sessione. */
  firstSwipeSuit: Suit | null;
  /** Carta calcolata (quadrante + secondi) al double tap. */
  resolvedCard: Card | null;

  /** Avvia/riavvia la sessione: nuovo contatore e stato pulito. */
  start: () => void;
  /** Cattura il seme — solo al primissimo swipe della sessione. */
  captureFirstSwipe: (x: number, y: number, w: number, h: number) => void;
  /** Rivela: calcola la carta dal seme catturato e dai secondi correnti. */
  reveal: (seconds: number) => void;
  /** Reinizializza all'ingresso nel gioco / nuova giocata. */
  reset: () => void;
};

export const useAcaanStore = create<AcaanState>((set, get) => ({
  startedAt: null,
  firstSwipeSuit: null,
  resolvedCard: null,

  start: () =>
    set({ startedAt: Date.now(), firstSwipeSuit: null, resolvedCard: null }),

  captureFirstSwipe: (x, y, w, h) => {
    // Il seme si fissa una sola volta: i swipe successivi sono ignorati.
    if (get().firstSwipeSuit !== null) return;
    set({ firstSwipeSuit: suitFromQuadrant(x, y, w, h) });
  },

  reveal: (seconds) => {
    const suit = get().firstSwipeSuit;
    if (suit === null) return; // nessun seme → nessuna rivelazione
    set({ resolvedCard: resolveCard(suit, seconds) });
  },

  reset: () =>
    set({ startedAt: null, firstSwipeSuit: null, resolvedCard: null }),
}));
