import type { SVGProps } from "react";

// Icona "chiudi/esci" (X) in avorio — uscita dal gioco a tutto schermo.
type CloseIconProps = SVGProps<SVGSVGElement> & { size?: number };

export function CloseIcon({ size = 24, ...props }: CloseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
