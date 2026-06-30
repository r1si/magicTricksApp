import { GAMES, availableCount } from "@/config/games.config";
import { GameCard } from "@/components/GameCard";
import { SecretFab } from "@/components/SecretFab";

export default function Home() {
  const label = `${availableCount} ${
    availableCount === 1 ? "gioco disponibile" : "giochi disponibili"
  } · altri in arrivo`;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-9 px-4 py-12">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-display text-display-xl">Trucchi di Magia</h1>
        <p className="text-ivory-50/55 font-mono text-xs tracking-wider uppercase">
          {label}
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {GAMES.map((game, i) => (
          <li key={game.slug}>
            <GameCard game={game} index={i} />
          </li>
        ))}
      </ul>

      <SecretFab />
    </main>
  );
}
