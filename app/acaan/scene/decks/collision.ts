// Collisioni tra carte sul feltro. Le carte sono rettangoli complanari (piano
// XZ del tavolo), quindi NON serve un motore fisico 3D: basta il classico test
// di sovrapposizione AABB + vettore di separazione minimo (MTV). Le rotazioni
// (yaw) delle carte distribuite sono piccole e qui trascurate.
import { CARD_W, CARD_H } from "./cardModel";

export type Rect = { x: number; z: number };

/** Due carte (stessa pianta) si sovrappongono sul tavolo? */
export function overlaps(a: Rect, b: Rect): boolean {
  return Math.abs(a.x - b.x) < CARD_W && Math.abs(a.z - b.z) < CARD_H;
}

/**
 * Spostamento minimo da applicare a `mover` perché non copra più `anchor`:
 * spinge lungo l'asse di minor compenetrazione (così la carta "scivola via" nel
 * modo più corto), con un piccolo `margin` extra per staccarla del tutto.
 * Restituisce {dx:0, dz:0} se già separate.
 */
export function separationVector(
  mover: Rect,
  anchor: Rect,
  margin = 0.14,
): { dx: number; dz: number } {
  const dx = mover.x - anchor.x;
  const dz = mover.z - anchor.z;
  const penX = CARD_W - Math.abs(dx);
  const penZ = CARD_H - Math.abs(dz);
  if (penX <= 0 || penZ <= 0) return { dx: 0, dz: 0 };
  if (penX < penZ) {
    // separa lungo X (lato corto): è il tragitto più breve.
    const dir = dx >= 0 ? 1 : -1;
    return { dx: dir * (penX + margin), dz: 0 };
  }
  const dir = dz >= 0 ? 1 : -1;
  return { dx: 0, dz: dir * (penZ + margin) };
}
