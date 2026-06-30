import { create } from "zustand";
import { persist } from "zustand/middleware";

// Impostazioni di integrazione del trucco ACAAN. Scelte dal mago nel dossier
// (/segreti/acaan) e lette dal gioco. Persistono in localStorage così la
// configurazione sopravvive tra la pagina del segreto e quella di gioco.

/** Come parte il gioco: dal mazzo sul feltro oppure dalla scatolina aperta. */
export type StartMode = "deck" | "box";
/** Da dove si legge il quadrante che fissa il SEME. */
export type QuadrantRef = "card" | "screen";
/** Quale orologio fornisce i secondi. */
export type ClockRef = "app" | "phone";

export type AcaanSettings = {
  startMode: StartMode;
  quadrant: QuadrantRef;
  clock: ClockRef;
};

export const DEFAULT_SETTINGS: AcaanSettings = {
  startMode: "deck",
  quadrant: "card",
  clock: "app",
};

type AcaanSettingsState = AcaanSettings & {
  setStartMode: (v: StartMode) => void;
  setQuadrant: (v: QuadrantRef) => void;
  setClock: (v: ClockRef) => void;
};

export const useAcaanSettings = create<AcaanSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setStartMode: (startMode) => set({ startMode }),
      setQuadrant: (quadrant) => set({ quadrant }),
      setClock: (clock) => set({ clock }),
    }),
    {
      name: "acaan:settings",
      version: 2,
      // v1 → v2: rimosso il setting "time" (su prima carta / su carta girata):
      // il valore si fissa sempre "su prima carta". Si aggiunge "startMode".
      migrate: (persisted) => {
        const prev = (persisted ?? {}) as Partial<AcaanSettings> & {
          time?: unknown;
        };
        delete prev.time;
        return {
          startMode: prev.startMode ?? DEFAULT_SETTINGS.startMode,
          quadrant: prev.quadrant ?? DEFAULT_SETTINGS.quadrant,
          clock: prev.clock ?? DEFAULT_SETTINGS.clock,
        };
      },
    },
  ),
);
