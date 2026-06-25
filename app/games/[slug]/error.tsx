"use client";

import { Button } from "@/components/Button";

// Error boundary di route: se il modulo del gioco fallisce, resta on-brand.
export default function GameError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-display text-title">Il trucco è svanito</h1>
      <p className="text-ivory-50/60 max-w-sm">
        Qualcosa è andato storto nel preparare il gioco. Riprova.
      </p>
      <Button onClick={reset}>Riprova</Button>
    </main>
  );
}
