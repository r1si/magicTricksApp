"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { type ThreeEvent } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import type { Card } from "@/lib/cards";
import { TABLE_Y } from "./decks/cardModel";
import { useFaceMaterial, useFlip } from "./flip";

const DOUBLE_TAP_MS = 320;
const TAP_SLOP = 8; // px: oltre questo è un drag, non un tap

type DealtCardProps = {
  geometry: THREE.BufferGeometry;
  /** Materiali condivisi: dorso (su +Y) e bordo carta. */
  backMat: THREE.Material;
  edge: THREE.Material;
  /** Maschera angoli arrotondati per la faccia rivelata. */
  alpha: THREE.Texture;
  /** Carta mostrata dopo il flip (null finché a dorso). */
  face: Card | null;
  x: number;
  z: number;
  rotZ: number;
  /** Sollevamento anti z-fighting in base all'ordine di distribuzione. */
  lift: number;
  revealed: boolean;
  /** Doppio tap sulla carta: chiede di girarla. */
  onReveal: () => void;
};

/**
 * Carta distribuita sul feltro. Posata **a dorso** nella posa in cui è stata
 * sfilata; la sua posizione (x/z) è animata, così può **scivolare via** quando
 * un'altra carta sotto viene scelta. Doppio tap → si **alza** di quanto basta a
 * non toccare nulla, **gira di lato** (rotazione attorno all'asse lungo) e
 * **ricade** mostrando la sua faccia. Rispetta prefers-reduced-motion (flip
 * immediato, senza sollevamento).
 */
export function DealtCard({
  geometry,
  backMat,
  edge,
  alpha,
  face,
  x,
  z,
  rotZ,
  lift,
  revealed,
  onReveal,
}: DealtCardProps) {
  const tap = useRef({ pointerId: -1, x: 0, y: 0, lastTap: 0 });

  // Faccia propria della carta (ogni carta girata ne mostra una diversa).
  const faceMat = useFaceMaterial(face, backMat, alpha);
  // Dorso sul +Y, faccia sul −Y (emerge col flip di π attorno all'asse lungo).
  const materials = useMemo<THREE.Material[]>(
    () => [backMat, faceMat, edge],
    [backMat, faceMat, edge],
  );

  // Posizione sul tavolo (animata): se cambia, la carta ci scivola sopra.
  const { px, pz } = useSpring({
    px: x,
    pz: z,
    config: { tension: 210, friction: 26 },
  });

  // Sollevamento + giro pilotati dalla meccanica condivisa.
  const { hop, flip } = useFlip(revealed);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    tap.current.pointerId = e.pointerId;
    tap.current.x = e.nativeEvent.clientX;
    tap.current.y = e.nativeEvent.clientY;
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    const t = tap.current;
    if (t.pointerId !== e.pointerId) return;
    e.stopPropagation();
    t.pointerId = -1;
    const moved = Math.hypot(
      e.nativeEvent.clientX - t.x,
      e.nativeEvent.clientY - t.y,
    );
    if (moved > TAP_SLOP) return; // era un drag/sfregamento, non un tap
    const now = e.nativeEvent.timeStamp;
    if (now - t.lastTap < DOUBLE_TAP_MS) {
      t.lastTap = 0;
      if (!revealed) onReveal();
    } else {
      t.lastTap = now;
    }
  };

  return (
    <animated.group
      position-x={px}
      position-y={TABLE_Y + lift}
      position-z={pz}
      rotation-y={rotZ}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <animated.group position-y={hop} rotation-z={flip}>
        <mesh geometry={geometry} material={materials} />
      </animated.group>
    </animated.group>
  );
}
