import Link from "next/link";
import type { Game } from "@/config/games.config";
import { SuitIcon, type Suit } from "@/components/icons/SuitIcon";
import { LockIcon } from "@/components/icons/LockIcon";

const isRed = (s: Suit) => s === "hearts" || s === "diamonds";
const pipColor = (s: Suit) => (isRed(s) ? "text-wine-600" : "text-felt-900");

function CornerIndex({ game, flipped }: { game: Game; flipped?: boolean }) {
  if (!game.index || !game.suit) return null;
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute flex flex-col items-center leading-none ${
        flipped ? "right-2 bottom-2 rotate-180" : "top-2 left-2"
      } ${pipColor(game.suit)}`}
    >
      <span className="text-display text-sm">{game.index}</span>
      <SuitIcon suit={game.suit} size={12} />
    </span>
  );
}

/**
 * Una card della Home. Available = carta scoperta (faccia avorio, giocabile);
 * coming-soon = carta coperta (dorso blu, lucchetto).
 */
export function GameCard({ game, index = 0 }: { game: Game; index?: number }) {
  const style = { animationDelay: `${index * 60}ms` };

  if (game.status === "available") {
    return (
      <Link
        href={`/games/${game.slug}`}
        aria-label={`Gioca a ${game.title}`}
        style={style}
        className="animate-card-in rounded-card bg-ivory-50 text-felt-900 shadow-card ring-felt-900/10 hover:shadow-glow-gold focus-visible:shadow-glow-gold relative flex aspect-[5/7] flex-col justify-between overflow-hidden p-3 ring-1 transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.98]"
      >
        <CornerIndex game={game} />
        <div className="flex flex-1 items-center justify-center">
          {game.suit && (
            <SuitIcon
              suit={game.suit}
              size={56}
              className={`${pipColor(game.suit)} opacity-90`}
            />
          )}
        </div>
        <div className="space-y-0.5">
          <h2 className="text-display text-lg leading-none">{game.title}</h2>
          {game.subtitle && (
            <p className="text-felt-900/55 text-[0.7rem]">{game.subtitle}</p>
          )}
        </div>
        <CornerIndex game={game} flipped />
      </Link>
    );
  }

  // coming-soon — carta coperta
  return (
    <div
      aria-label={`${game.title} — in arrivo`}
      style={style}
      className="animate-card-in card-back rounded-card shadow-card ring-ivory-50/15 relative flex aspect-[5/7] flex-col items-center justify-center gap-3 p-3 opacity-60 ring-1"
    >
      <span className="border-ivory-50/20 pointer-events-none absolute inset-1.5 rounded-[7px] border" />
      <LockIcon size={26} className="text-ivory-50/70" />
      <span className="text-ivory-50/70 text-[0.7rem] font-medium tracking-wider uppercase">
        In arrivo
      </span>
    </div>
  );
}
