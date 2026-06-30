"use client";

import Link from "next/link";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { useGameChrome } from "@/lib/gameChrome";

// Uscita discreta in alto a destra del contenitore di gioco. Si dissolve quando
// un gioco chiede di nascondere il chrome (vedi lib/gameChrome): in ACAAN
// scatolina la X sparisce con lo swipe e resta nascosta per la partita.
export function GameCloseButton() {
  const hidden = useGameChrome((s) => s.hidden);

  return (
    <Link
      href="/"
      aria-label="Torna alla collezione"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : undefined}
      className={`text-ivory-50/70 hover:bg-ivory-50/10 hover:text-ivory-50 absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-20 inline-flex h-11 w-11 items-center justify-center rounded-full transition-opacity duration-500 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <CloseIcon size={20} />
    </Link>
  );
}
