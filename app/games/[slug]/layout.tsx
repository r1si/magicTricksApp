import Link from "next/link";
import { CloseIcon } from "@/components/icons/CloseIcon";

// Contenitore del gioco a tutto schermo. Uscita discreta in alto a destra
// (l'orologio del metodo vivrà in alto a sinistra — vedi Step 06).
export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col">
      <Link
        href="/"
        aria-label="Torna alla collezione"
        className="text-ivory-50/70 hover:bg-ivory-50/10 hover:text-ivory-50 absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-20 inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors"
      >
        <CloseIcon size={20} />
      </Link>
      {children}
    </div>
  );
}
