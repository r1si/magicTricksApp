"use client";

// Meccanica condivisa del "flip" di una carta (sollevamento + giro attorno
// all'asse lungo) e materiale della faccia rivelata. Usata sia dalla carta in
// cima al mazzo (ActiveCard) sia dalle carte distribuite (DealtCard), così la
// stessa animazione non vive duplicata in due punti.
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useSpring, type Interpolation } from "@react-spring/three";
import type { Card } from "@/lib/cards";
import { createFaceTexture } from "./cardTextures";
import { CARD_W } from "./decks/cardModel";

// Sollevamento al culmine del giro: deve superare il semilato corto della carta
// (CARD_W/2), perché girando di lato la carta ruota attorno al suo asse lungo e
// gli spigoli arrivano a quella distanza dal centro → così non tocca il feltro.
const FLIP_LIFT = CARD_W / 2 + 0.07;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (v: number) => v * v * (3 - 2 * v);
// Ease-in-out: parte e finisce morbida (per il sollevamento e l'atterraggio).
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Materiale della faccia rivelata. La texture è ruotata di π: girando attorno
 * all'asse lungo la faccia emerge capovolta, così la riporto dritta. Se la carta
 * non ha ancora identità (face null) riusa il dorso.
 */
export function useFaceMaterial(
  face: Card | null,
  backMat: THREE.Material,
  alpha: THREE.Texture,
): THREE.Material {
  return useMemo(() => {
    if (!face) return backMat;
    const tex = createFaceTexture(face);
    tex.center.set(0.5, 0.5);
    tex.rotation = Math.PI;
    return new THREE.MeshStandardMaterial({
      map: tex,
      alphaMap: alpha,
      alphaTest: 0.35,
      roughness: 0.48,
      metalness: 0.03,
    });
  }, [face, backMat, alpha]);
}

/**
 * Un solo valore 0→1 pilota sollevamento e giro: prima la carta si alza, poi
 * (mentre è in alto) gira di lato, infine ricade. Rispetta
 * prefers-reduced-motion (flip immediato, senza sollevamento).
 */
export function useFlip(revealed: boolean): {
  hop: Interpolation<number, number>;
  flip: Interpolation<number, number>;
} {
  const reduced = usePrefersReducedMotion();
  const { t } = useSpring({
    t: revealed ? 1 : 0,
    immediate: reduced,
    config: { duration: 680, easing: easeInOut },
  });
  const hop = t.to((v) => Math.sin(clamp01(v) * Math.PI) * FLIP_LIFT);
  const flip = t.to((v) => smoothstep(clamp01((v - 0.12) / 0.74)) * Math.PI);
  return { hop, flip };
}
