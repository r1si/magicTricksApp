"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDrag } from "@use-gesture/react";
import { Button } from "@/components/Button";
import { useAcaanStore } from "./state/store";
import { getMethodSeconds } from "./hooks/useMethodClock";
import { MethodClock } from "./components/MethodClock";
import DeckScene from "./scene/DeckScene";

// Gioco ACAAN. Caricato on-demand (ssr:false) dal GameLoader → solo client.
export default function AcaanGame() {
  const start = useAcaanStore((s) => s.start);
  const containerRef = useRef<HTMLDivElement>(null);
  // Offset orizzontale normalizzato del riffle (transiente, no re-render).
  const dragRef = useRef(0);

  useEffect(() => {
    start();
  }, [start]);

  // Solo in sviluppo: espone lo store per i test E2E (mai in produzione,
  // svelerebbe il metodo segreto).
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __acaanStore?: unknown }).__acaanStore =
        useAcaanStore;
    }
  }, []);

  const bind = useDrag(
    ({ first, last, initial: [ix, iy], movement: [mx, my], tap }) => {
      const el = containerRef.current;
      if (!el || tap) return;

      // Cattura il SEME al primissimo swipe reale (lo store ignora i successivi).
      // Nessun feedback visibile: deve restare segreto.
      if (first || Math.hypot(mx, my) > 8) {
        const r = el.getBoundingClientRect();
        useAcaanStore
          .getState()
          .captureFirstSwipe(ix - r.left, iy - r.top, r.width, r.height);
      }

      // Riffle: offset normalizzato, ritorno al centro al rilascio.
      dragRef.current = last
        ? 0
        : Math.max(-1, Math.min(1, mx / (el.clientWidth * 0.4)));
    },
    { filterTaps: true },
  );

  const handleReveal = useCallback(() => {
    useAcaanStore.getState().reveal(getMethodSeconds());
  }, []);

  // Nuova giocata: rimette la carta a dorso e riavvia il contatore.
  const handleAgain = useCallback(() => {
    useAcaanStore.getState().start();
  }, []);

  const resolvedCard = useAcaanStore((s) => s.resolvedCard);

  return (
    <div
      ref={containerRef}
      {...bind()}
      className="relative min-h-0 flex-1 touch-none select-none"
    >
      <DeckScene
        activeCard={resolvedCard}
        dragRef={dragRef}
        onReveal={handleReveal}
      />
      <MethodClock />

      {resolvedCard && (
        <div className="absolute inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] flex justify-center">
          <Button variant="secondary" onClick={handleAgain}>
            Di nuovo
          </Button>
        </div>
      )}
    </div>
  );
}
