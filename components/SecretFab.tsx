"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SECRETS } from "@/config/secrets.config";
import { KeyholeIcon } from "@/components/icons/KeyholeIcon";

/**
 * Pulsante "segreto" flottante (in basso a destra della Home). Apre un piccolo
 * menu dei dossier del mago; selezionando un gioco si va alla sua spiegazione.
 * Discreto e tematico: il buco della serratura come accesso al metodo.
 */
export function SecretFab() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Chiudi cliccando fuori o con Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-3"
    >
      {open && (
        <div
          role="menu"
          aria-label="Segreti del mago"
          className="animate-card-in keyline w-66 origin-bottom-right overflow-hidden p-2"
        >
          <p className="text-gold-500/90 px-2 pt-1 pb-2 font-mono text-[0.65rem] tracking-wider uppercase">
            Dossier del mago
          </p>
          <ul className="flex flex-col">
            {SECRETS.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/segreti/${s.slug}`}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="hover:bg-ivory-50/10 flex items-center gap-3 rounded-md p-2 transition-colors"
                >
                  <span className="bg-felt-900/60 text-gold-500 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                    <KeyholeIcon size={18} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-display text-sm leading-tight">
                      {s.title}
                    </span>
                    <span className="text-ivory-50/55 text-xs">
                      Come funziona e come eseguirlo
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Segreti del mago"
        onClick={() => setOpen((v) => !v)}
        className="border-ivory-50/30 bg-surface text-gold-500 shadow-float hover:border-ivory-50/60 hover:shadow-glow-gold inline-flex h-14 w-14 items-center justify-center rounded-full border-[1.5px] transition-[transform,box-shadow,border-color] duration-150 ease-out active:scale-95"
      >
        <KeyholeIcon size={24} />
      </button>
    </div>
  );
}
