"use client";

import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { Card } from "@/lib/cards";
import { createBackTexture, createFaceTexture } from "./cardTextures";
import { ActiveCard } from "./ActiveCard";

// Dimensioni carta (unità scena). Spessore su Y → pila lungo l'asse verticale.
export const CARD_W = 0.64;
export const CARD_T = 0.003; // ~ proporzioni reali del mazzo (54 carte)
export const CARD_H = 0.89;

// 53 carte nel pile instanziato + 1 carta attiva separata = 54 (52 + 2 jolly).
const BODY_COUNT = 53;

// Ordine gruppi materiali di BoxGeometry: [+X, -X, +Y, -Y, +Z, -Z].
// +Y (top) e -Y (bottom) sono le facce grandi; ±X, ±Z sono i bordi sottili.
function useCardMaterials(activeCard: Card | null) {
  const back = useMemo(() => createBackTexture(), []);

  const edge = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#efe7d4", // ivory-100 — bordo carta
        roughness: 0.6,
        metalness: 0.04,
      }),
    [],
  );

  const backMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: back,
        roughness: 0.4,
        metalness: 0.1,
      }),
    [back],
  );

  // Faccia rivelata sul lato -Y della carta attiva (visibile dopo il flip).
  const faceMat = useMemo(() => {
    if (!activeCard) return backMat;
    return new THREE.MeshStandardMaterial({
      map: createFaceTexture(activeCard),
      roughness: 0.45,
      metalness: 0.06,
    });
  }, [activeCard, backMat]);

  const pile = useMemo(
    () => [edge, edge, backMat, backMat, edge, edge],
    [edge, backMat],
  );
  const active = useMemo(
    () => [edge, edge, backMat, faceMat, edge, edge],
    [edge, backMat, faceMat],
  );

  return { pile, active };
}

type DeckProps = {
  /** Faccia da rivelare sul lato inferiore della carta attiva. */
  activeCard?: Card | null;
  /** Offset orizzontale normalizzato (-1..1) per il riffle in risposta al swipe. */
  dragRef?: RefObject<number>;
  /** Chiamata al double tap sulla carta attiva. */
  onReveal?: () => void;
};

/**
 * Mazzo 3D: pila instanziata (dorso blu, bordi avorio) + carta attiva separata
 * in cima, pronta per il flip (Step 10). Il swipe la fa "scorrere" (riffle);
 * il double tap innesca la rivelazione.
 */
export function Deck({ activeCard = null, dragRef, onReveal }: DeckProps) {
  const geom = useMemo(() => new THREE.BoxGeometry(CARD_W, CARD_T, CARD_H), []);
  const { pile, active } = useCardMaterials(activeCard);
  const instRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = instRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    for (let i = 0; i < BODY_COUNT; i++) {
      m.makeTranslation(0, i * CARD_T + CARD_T / 2, 0);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  const topY = BODY_COUNT * CARD_T + CARD_T / 2;

  return (
    <group>
      <instancedMesh
        ref={instRef}
        args={[geom, pile, BODY_COUNT]}
        frustumCulled={false}
      />
      <ActiveCard
        geometry={geom}
        materials={active}
        topY={topY}
        revealed={activeCard !== null}
        dragRef={dragRef}
        onReveal={onReveal}
      />
    </group>
  );
}
