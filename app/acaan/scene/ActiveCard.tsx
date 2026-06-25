"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import { Sparkles } from "@react-three/drei";

// Easing ~ cubic-bezier(.2,.7,.2,1) del designPattern §10 (ease-out deciso).
const easeReveal = (t: number) => 1 - Math.pow(1 - t, 3);

function usePrefersReducedMotion() {
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

// Lampo di scintille dorate: visibile al mount, si spegne dopo 700ms (mai loop
// di fondo — designPattern §8.5). Rimontato a ogni nuova rivelazione.
function SparkleBurst() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 700);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <Sparkles
      count={26}
      scale={[0.95, 0.5, 1.2]}
      size={4}
      speed={0.5}
      opacity={0.9}
      color="#e8be5c"
      position={[0, 0.18, 0]}
    />
  );
}

type ActiveCardProps = {
  geometry: THREE.BufferGeometry;
  materials: THREE.Material[];
  topY: number;
  /** Non-null quando la carta è stata rivelata → innesca il flip. */
  revealed: boolean;
  dragRef?: RefObject<number>;
  onReveal?: () => void;
};

/**
 * Carta attiva in cima al mazzo. A riposo segue il riffle (swipe); al double
 * tap chiama onReveal. Quando `revealed` diventa true ruota di 180° (la faccia,
 * sul lato −Y, emerge: nessuno spoiler prima del giro) con glow oro e scintille.
 * Rispetta prefers-reduced-motion (flip istantaneo, niente scintille).
 */
export function ActiveCard({
  geometry,
  materials,
  topY,
  revealed,
  dragRef,
  onReveal,
}: ActiveCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lastTap = useRef(0);
  const reduced = usePrefersReducedMotion();

  const { flip } = useSpring({
    flip: revealed ? Math.PI : 0,
    immediate: reduced,
    config: { duration: 520, easing: easeReveal },
  });

  // Glow oro proporzionale al flip (0 a dorso → acceso a carta rivelata).
  const glow = flip.to((r) => (r / Math.PI) * 1.7);

  // Riffle a riposo; quando rivelata, la carta si ricentra (X/Z → 0).
  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const drag = revealed ? 0 : (dragRef?.current ?? 0);
    const tx = drag * 0.18;
    const tz = -drag * 0.12;
    mesh.position.x += (tx - mesh.position.x) * 0.18;
    mesh.rotation.z += (tz - mesh.rotation.z) * 0.18;
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const now = e.timeStamp;
    if (now - lastTap.current < 320) {
      lastTap.current = 0;
      onReveal?.();
    } else {
      lastTap.current = now;
    }
  };

  return (
    <group position={[0, topY, 0]}>
      <animated.mesh
        ref={meshRef}
        geometry={geometry}
        material={materials}
        rotation-x={flip}
        onPointerDown={handlePointerDown}
      />
      <animated.pointLight
        color="#dca12c"
        distance={2.2}
        intensity={glow}
        position={[0, 0.25, 0]}
      />
      {revealed && !reduced && <SparkleBurst />}
    </group>
  );
}
