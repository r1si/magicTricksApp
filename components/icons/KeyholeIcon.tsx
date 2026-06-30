import type { SVGProps } from "react";

// Buco della serratura: l'accesso al "segreto" del trucco.
type KeyholeIconProps = SVGProps<SVGSVGElement> & { size?: number };

export function KeyholeIcon({ size = 24, ...props }: KeyholeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2a6 6 0 0 0-3 11.2L8 20.6A1.2 1.2 0 0 0 9.2 22h5.6a1.2 1.2 0 0 0 1.2-1.4l-1-7.4A6 6 0 0 0 12 2Zm0 4.4a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2Z" />
    </svg>
  );
}
