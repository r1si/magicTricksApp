"use client";

import { useState } from "react";
import { CloseIcon } from "@/components/icons/CloseIcon";

/**
 * Promemoria mostrato quando l'orologio del metodo è quello del TELEFONO: il
 * gioco legge i secondi reali del sistema, quindi il mago deve poterli vedere
 * sul proprio dispositivo. Compare al posto dell'orologio in-app, in alto, ed è
 * richiudibile. Non cattura i gesti del canvas (solo il pulsante di chiusura).
 */
export function PhoneClockNotice() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex justify-center px-4">
      <div className="keyline pointer-events-auto flex max-w-sm items-start gap-3 px-3 py-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-gold-500/90 font-mono text-[0.65rem] tracking-[0.18em] uppercase">
            Orologio del telefono
          </span>
          <span className="text-ivory-50/75 text-xs">
            Il valore segue i secondi reali. Attivali nell’orologio del tuo
            dispositivo per leggerli a colpo d’occhio.
          </span>
        </div>
        <button
          type="button"
          aria-label="Chiudi promemoria"
          onClick={() => setOpen(false)}
          className="text-ivory-50/50 hover:text-ivory-50 -mr-1 shrink-0 transition-colors"
        >
          <CloseIcon size={16} />
        </button>
      </div>
    </div>
  );
}
