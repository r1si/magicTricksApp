"use client";

import { useEffect, useState } from "react";
import { useAcaanStore } from "../state/store";
import { methodClock, methodSeconds, type ClockReadout } from "../logic/clock";

/**
 * Secondi correnti del metodo, derivati dall'avvio memorizzato nello store.
 * Usato anche dalla rivelazione (double tap) per leggere lo stesso valore
 * che l'orologio mostra. NB: funzione semplice, non un hook.
 */
export function getMethodSeconds(): number {
  const startedAt = useAcaanStore.getState().startedAt ?? Date.now();
  return methodSeconds(startedAt, Date.now());
}

/** Readout dell'orologio aggiornato a 1 Hz. */
export function useMethodClock(): ClockReadout {
  const startedAt = useAcaanStore((s) => s.startedAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return methodClock(startedAt ?? now, now);
}
