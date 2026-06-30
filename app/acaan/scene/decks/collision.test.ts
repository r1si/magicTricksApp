import { describe, it, expect } from "vitest";
import { overlaps, separationVector } from "./collision";
import { CARD_W, CARD_H } from "./cardModel";

describe("overlaps", () => {
  it("rileva due carte coincidenti come sovrapposte", () => {
    expect(overlaps({ x: 0, z: 0 }, { x: 0, z: 0 })).toBe(true);
  });
  it("considera separate carte oltre l'ingombro", () => {
    expect(overlaps({ x: 0, z: 0 }, { x: CARD_W + 0.01, z: 0 })).toBe(false);
    expect(overlaps({ x: 0, z: 0 }, { x: 0, z: CARD_H + 0.01 })).toBe(false);
  });
});

describe("separationVector", () => {
  it("separa lungo l'asse di minor compenetrazione (X corto)", () => {
    const v = separationVector({ x: 0.1, z: 0 }, { x: 0, z: 0 });
    expect(v.dz).toBe(0);
    expect(v.dx).toBeGreaterThan(0); // spinge verso destra (mover è a destra)
  });
  it("dopo lo spostamento le carte non si sovrappongono più", () => {
    const anchor = { x: 0, z: 0 };
    const mover = { x: 0.08, z: 0.05 };
    const v = separationVector(mover, anchor);
    const moved = { x: mover.x + v.dx, z: mover.z + v.dz };
    expect(overlaps(moved, anchor)).toBe(false);
  });
  it("restituisce vettore nullo se già separate", () => {
    const v = separationVector({ x: CARD_W + 0.5, z: 0 }, { x: 0, z: 0 });
    expect(v).toEqual({ dx: 0, dz: 0 });
  });
});
