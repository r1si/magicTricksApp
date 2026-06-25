import type { Metadata } from "next";
import { SuitIcon } from "@/components/icons/SuitIcon";

export const metadata: Metadata = { title: "Offline · Trucchi di Magia" };

// Offline shell: mostrata dal service worker quando manca la rete.
export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center">
      <SuitIcon suit="spades" size={48} className="text-ivory-50/40" />
      <h1 className="text-display text-title">Nessuna connessione</h1>
      <p className="text-ivory-50/60 max-w-sm text-balance">
        Il sipario è giù per un istante. Torna online e la magia riprende da
        dove l&apos;avevi lasciata.
      </p>
    </main>
  );
}
