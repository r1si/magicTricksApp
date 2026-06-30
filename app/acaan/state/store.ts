import { create } from "zustand";
import type { Suit, Card } from "@/lib/cards";
import { suitFromQuadrant, resolveCard } from "../logic/resolveCard";

// Stato condiviso ACAAN (specs.md §6.6). La scena 3D NON conosce il metodo:
// legge solo `resolvedCard` al momento del flip. QUANDO seme e secondi vengono
// fissati dipende dalle impostazioni di integrazione (vedi state/settings.ts) ed
// è orchestrato dal gioco; lo store si limita a registrarli una volta sola.
type AcaanState = {
  /** Istante d'avvio del contatore dei secondi (epoch ms); null se non avviato. */
  startedAt: number | null;
  /** Seme fissato dal comando del quadrante; resta invariato per la sessione. */
  suit: Suit | null;
  /** Secondi che fissano il valore (letti all'inizio del gesto); null se non ancora. */
  valueSeconds: number | null;
  /** Carta del metodo, calcolata al momento della rivelazione. */
  resolvedCard: Card | null;

  /** Avvia/riavvia la sessione: nuovo contatore e stato pulito. */
  start: () => void;
  /** Fissa il seme dal quadrante (px schermo oppure uv 0..1 della carta). Una volta sola. */
  captureSuit: (x: number, y: number, w: number, h: number) => void;
  /** Fissa i secondi del valore (all'inizio del gesto scelto). Una volta sola. */
  captureSeconds: (seconds: number) => void;
  /**
   * Rivela la carta del metodo: usa i secondi fissati (se presenti) altrimenti,
   * come ripiego, quelli correnti passati ora. Una volta sola.
   */
  reveal: (currentSeconds: number) => void;
  /** Reinizializza all'ingresso nel gioco / nuova giocata. */
  reset: () => void;
};

const empty = {
  suit: null,
  valueSeconds: null,
  resolvedCard: null,
} as const;

export const useAcaanStore = create<AcaanState>((set, get) => ({
  startedAt: null,
  ...empty,

  start: () => set({ startedAt: Date.now(), ...empty }),

  captureSuit: (x, y, w, h) => {
    if (get().suit !== null) return; // il seme si fissa una sola volta
    set({ suit: suitFromQuadrant(x, y, w, h) });
  },

  captureSeconds: (seconds) => {
    if (get().valueSeconds !== null) return; // i secondi si fissano una sola volta
    set({ valueSeconds: seconds });
  },

  reveal: (currentSeconds) => {
    if (get().resolvedCard !== null) return; // già rivelata: resta quella
    const suit = get().suit;
    if (suit === null) return; // nessun seme → nessuna rivelazione
    const seconds = get().valueSeconds ?? currentSeconds;
    set({ resolvedCard: resolveCard(suit, seconds) });
  },

  reset: () => set({ startedAt: null, ...empty }),
}));
