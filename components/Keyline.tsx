import type { ComponentPropsWithoutRef } from "react";

type KeylineProps = ComponentPropsWithoutRef<"div"> & {
  /** Accende e ispessisce la cornice (stato selezionato/attivo). */
  active?: boolean;
};

/**
 * Elemento firma dell'app: la "cornice avorio".
 * Avvolge una superficie così che sembri una carta appoggiata sul feltro.
 */
export function Keyline({
  active = false,
  className = "",
  ...props
}: KeylineProps) {
  return (
    <div
      className={`keyline ${active ? "keyline-active" : ""} ${className}`}
      {...props}
    />
  );
}
