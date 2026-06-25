"use client";

import { Suspense, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import type { Card } from "@/lib/cards";
import { Deck } from "./Deck";

type DeckSceneProps = {
  activeCard?: Card | null;
  dragRef?: RefObject<number>;
  onReveal?: () => void;
};

// Palco 3D di ACAAN. Canvas trasparente: sotto resta il gradiente feltro (CSS).
// Luci calde "da palcoscenico" + environment procedurale (Lightformer) per
// riflessi premium senza caricare HDR esterni (offline/CSP-safe).
// Ombre disattivate: usiamo ContactShadows (morbide, leggere su mobile).

// Riflessi: environment procedurale, nessun file esterno. Isolato in un proprio
// <Suspense> così la scena resta visibile anche mentre l'env si prepara.
function StageEnvironment() {
  return (
    <Environment resolution={128} environmentIntensity={0.6}>
      <Lightformer
        form="rect"
        intensity={3}
        color="#fff0d6"
        position={[2, 3, 2]}
        scale={[4, 4, 1]}
        target={[0, 0, 0]}
      />
      <Lightformer
        form="rect"
        intensity={1.2}
        color="#1a6b47"
        position={[-3, 1, -2]}
        scale={[5, 5, 1]}
        target={[0, 0, 0]}
      />
    </Environment>
  );
}

export default function DeckScene({
  activeCard = null,
  dragRef,
  onReveal,
}: DeckSceneProps) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 1.0, 2.6], fov: 35 }}
      onCreated={({ camera }) => camera.lookAt(new THREE.Vector3(0, 0.1, 0))}
    >
      {/* Luci base: non sospendono, garantiscono la visibilità del mazzo. */}
      <ambientLight intensity={0.55} color="#fff2da" />
      <directionalLight position={[3, 5, 2]} intensity={2.4} color="#ffe7c2" />

      <Deck activeCard={activeCard} dragRef={dragRef} onReveal={onReveal} />

      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.45}
        scale={4}
        blur={2.6}
        far={1.5}
        resolution={256}
        color="#06231a"
      />

      <Suspense fallback={null}>
        <StageEnvironment />
      </Suspense>
    </Canvas>
  );
}
