"use client";

import { useMethodClock } from "../hooks/useMethodClock";
import { formatClock } from "../logic/clock";

/**
 * Orologio del metodo: HH:MM:SS in alto a sinistra (designPattern §8.3).
 * Volutamente un orpello innocuo — mono, muted, senza riquadro né icona.
 * I secondi sono il contatore controllato (specs §4). Invisibile agli screen
 * reader e non cattura i gesti del canvas sottostante.
 */
export function MethodClock() {
  const readout = useMethodClock();

  return (
    <span
      aria-hidden="true"
      className="text-ivory-50/55 pointer-events-none absolute top-[max(0.75rem,env(safe-area-inset-top))] left-[max(0.75rem,env(safe-area-inset-left))] z-10 font-mono text-sm tabular-nums select-none"
    >
      {formatClock(readout)}
    </span>
  );
}
