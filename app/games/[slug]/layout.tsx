import { GameCloseButton } from "@/components/GameCloseButton";

// Contenitore del gioco a tutto schermo. Uscita discreta in alto a destra
// (l'orologio del metodo vivrà in alto a sinistra — vedi Step 06).
export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col">
      <GameCloseButton />
      {children}
    </div>
  );
}
