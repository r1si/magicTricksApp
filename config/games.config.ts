// Registro centrale dei giochi — alimenta la Home (vedi specs.md §2).
import type { Suit } from "@/components/icons/SuitIcon";

export type GameStatus = "available" | "coming-soon";

export type Game = {
  slug: string;
  title: string;
  subtitle?: string;
  status: GameStatus;
  icon: string;
  /** Pip mostrato sulla "carta scoperta" in Home (solo giochi available). */
  suit?: Suit;
  /** Indice d'angolo della carta (es. "A" per ACAAN = Asso di picche). */
  index?: string;
};

export const GAMES: Game[] = [
  {
    slug: "acaan",
    title: "ACAAN",
    subtitle: "Any Card At Any Number",
    status: "available",
    icon: "/icons/acaan.svg",
    suit: "spades",
    index: "A",
  },
  // Giochi futuri: carte ancora coperte sul tavolo.
  {
    slug: "il-pensiero",
    title: "Il Pensiero",
    status: "coming-soon",
    icon: "/icons/acaan.svg",
  },
  {
    slug: "la-predizione",
    title: "La Predizione",
    status: "coming-soon",
    icon: "/icons/acaan.svg",
  },
  {
    slug: "il-filo-invisibile",
    title: "Il Filo Invisibile",
    status: "coming-soon",
    icon: "/icons/acaan.svg",
  },
];

/** Numero di giochi attualmente giocabili. */
export const availableCount = GAMES.filter(
  (g) => g.status === "available",
).length;
