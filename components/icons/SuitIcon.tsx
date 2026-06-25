import type { SVGProps } from "react";
import type { Suit } from "@/lib/cards";

export type { Suit };

// Forme piene, vettoriali, coerenti col logo (no skeumorfismo). Usano
// `currentColor`: il colore si controlla dall'esterno (es. text-wine-600 per i
// semi rossi, text-ivory-50 / text-felt-900 per i neri — designPattern §9).
const PATHS: Record<Suit, string> = {
  hearts:
    "M12 21s-7.5-4.9-9.9-9.4C.7 8.9 2.1 5.5 5.3 5.5c1.9 0 3.3 1 3.7 2.3.4-1.3 1.8-2.3 3.7-2.3 3.2 0 4.6 3.4 3.2 6.1C19.5 16.1 12 21 12 21z",
  diamonds:
    "M12 2c2.5 4.2 5 7 8 10-3 3-5.5 5.8-8 10-2.5-4.2-5-7-8-10 3-3 5.5-5.8 8-10z",
  clubs:
    "M12 2.5a3.6 3.6 0 0 0-2.6 6.1A3.6 3.6 0 1 0 8 14.6c1 0 1.9-.4 2.6-1-.2 2-.9 3.6-2.1 5.2h7c-1.2-1.6-1.9-3.2-2.1-5.2.7.6 1.6 1 2.6 1a3.6 3.6 0 1 0-1.4-6 3.6 3.6 0 0 0-2.6-6.1z",
  spades:
    "M12 2.5c2 3 9 6.2 9 11a4 4 0 0 1-6.6 3c.2 2 .9 3.7 2.1 5.3h-9c1.2-1.6 1.9-3.3 2.1-5.3A4 4 0 0 1 3 13.5c0-4.8 7-8 9-11z",
};

type SuitIconProps = SVGProps<SVGSVGElement> & {
  suit: Suit;
  size?: number;
};

export function SuitIcon({ suit, size = 24, ...props }: SuitIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d={PATHS[suit]} />
    </svg>
  );
}
