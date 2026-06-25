import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  /**
   * `primary` — bottone "magico": avorio pieno, glow oro discreto al press.
   * `secondary` — trasparente con cornice avorio.
   */
  variant?: "primary" | "secondary";
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 " +
  "text-sm font-medium transition-[transform,box-shadow,background-color] " +
  "duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none " +
  "disabled:opacity-50";

const variants = {
  primary:
    "bg-ivory-50 text-felt-900 hover:shadow-glow-gold active:shadow-glow-gold",
  secondary:
    "border-[1.5px] border-ivory-50/40 text-ivory-50 hover:border-ivory-50/70",
} as const;

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
