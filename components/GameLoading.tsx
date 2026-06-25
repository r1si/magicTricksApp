import { SuitIcon } from "@/components/icons/SuitIcon";

// Stato di caricamento on-brand mentre il modulo del gioco si scarica.
export function GameLoading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <SuitIcon
        suit="spades"
        size={40}
        className="text-gold-500/70 animate-pulse"
      />
    </div>
  );
}
