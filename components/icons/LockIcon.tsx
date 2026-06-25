import type { SVGProps } from "react";

// Lucchetto in avorio per lo stato "coming-soon". Tratto ottico ~2px,
// usa currentColor (designPattern §9).
type LockIconProps = SVGProps<SVGSVGElement> & { size?: number };

export function LockIcon({ size = 24, ...props }: LockIconProps) {
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
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
