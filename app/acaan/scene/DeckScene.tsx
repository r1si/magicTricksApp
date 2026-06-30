"use client";

import { Suspense, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  ContactShadows,
  OrbitControls,
  Stats,
} from "@react-three/drei";
import { Deck } from "./Deck";
import { CameraIntro } from "./CameraIntro";
import { Scatolina } from "./Scatolina";
import { ScatolinaMesh } from "./ScatolinaMesh";
import type { Card } from "@/lib/cards";
import type { CardControl, CardXform, DealtCard } from "./decks/types";

type Phase = "box-intro" | "play";

// Contatore FPS di debug: si attiva con `?fps` nell'URL (mai per l'utente
// finale). Pannello stats.js in alto a sinistra: FPS, MS/frame, memoria.
const SHOW_STATS =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("fps");

type DeckSceneProps = {
  /** Fase corrente: intro scatola oppure gioco (mazzo sempre montato sotto). */
  phase: Phase;
  /** ?debug=box: mostra solo l'astuccio, isolato e ispezionabile (OrbitControls). */
  debugBox?: boolean;
  /** Inizio del gesto sulla scatola: il gioco fissa l'istante del valore. */
  onBoxGrab: () => void;
  /** Swipe completato: la scatola scivola fuori campo (valore confermato). */
  onBoxReleased: () => void;
  /** La scatola è uscita dal campo: si passa alla fase di gioco. */
  onBoxExited: () => void;
  dealt: DealtCard[];
  control: RefObject<CardControl>;
  activeXform: RefObject<CardXform>;
  activeKey: number;
  remaining: number;
  topFace: Card | null;
  topRevealed: boolean;
  onDeal: (pose: CardXform) => void;
  onRevealCard: (id: number) => void;
  onRevealTop: () => void;
  onPointerDownInfo: (info: { u: number; v: number }) => void;
  onCull: (ids: number[]) => void;
};

// Palco 3D di ACAAN. Canvas trasparente: sotto resta il gradiente feltro (CSS).
// Luci calde "da palcoscenico" + environment procedurale (Lightformer) per
// riflessi premium senza caricare HDR esterni (offline/CSP-safe).

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
  phase,
  debugBox = false,
  onBoxGrab,
  onBoxReleased,
  onBoxExited,
  dealt,
  control,
  activeXform,
  activeKey,
  remaining,
  topFace,
  topRevealed,
  onDeal,
  onRevealCard,
  onRevealTop,
  onPointerDownInfo,
  onCull,
}: DeckSceneProps) {
  // Debug: solo l'astuccio, isolato, con camera orbitabile per ispezionarlo.
  if (debugBox) {
    return (
      <Canvas
        className="!absolute inset-0"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 1.7, 1.45], fov: 36 }}
      >
        <ambientLight intensity={0.42} color="#fff2da" />
        <directionalLight
          position={[2.2, 4.6, 1.2]}
          intensity={2.8}
          color="#ffe7c2"
        />
        <ScatolinaMesh />
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.58}
          scale={3.2}
          blur={2.0}
          far={1.2}
          resolution={256}
          color="#06231a"
        />
        <OrbitControls target={[0, 0, 0]} />
        <Suspense fallback={null}>
          <StageEnvironment />
        </Suspense>
      </Canvas>
    );
  }

  return (
    <Canvas
      className="!absolute inset-0"
      // Cap del dpr a 1.5: con la vista quasi zenitale il feltro+carte riempiono
      // tutto il viewport, e a dpr 2 (4× i pixel) il fill-rate su telefono fa
      // scattare la scena. 1.5 è il compromesso nitidezza/fluidità su mobile.
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 1.35, 2.35], fov: 34 }}
    >
      {/* Ingresso camera: parte come ora e sale verso la vista dall'alto. */}
      <CameraIntro />

      {/* Luci base: non sospendono, garantiscono la visibilità del mazzo. */}
      <ambientLight intensity={0.42} color="#fff2da" />
      <directionalLight
        position={[2.2, 4.6, 1.2]}
        intensity={2.8}
        color="#ffe7c2"
      />

      {/* Mazzo sempre presente. Durante l'intro scatolina è visibile sotto la
          custodia, ma non interattivo (il catcher della scatola scherma i tap). */}
      <Deck
        dealt={dealt}
        control={control}
        activeXform={activeXform}
        activeKey={activeKey}
        remaining={remaining}
        topFace={topFace}
        topRevealed={topRevealed}
        onDeal={onDeal}
        onRevealCard={onRevealCard}
        onRevealTop={onRevealTop}
        onPointerDownInfo={onPointerDownInfo}
        onCull={onCull}
      />

      {phase === "box-intro" && (
        <Suspense fallback={null}>
          <Scatolina
            onGrab={onBoxGrab}
            onReleased={onBoxReleased}
            onExited={onBoxExited}
          />
        </Suspense>
      )}

      {/* Ombra di contatto: l'ombra è già morbida (blur 2.0), quindi 128 di
          risoluzione è indistinguibile da 256 ma dimezza il costo del pass
          che gira a ogni frame su tutta la geometria (pila + carte distribuite). */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.58}
        scale={3.2}
        blur={2.0}
        far={1.2}
        resolution={128}
        color="#06231a"
      />

      <Suspense fallback={null}>
        <StageEnvironment />
      </Suspense>

      {SHOW_STATS && <Stats />}
    </Canvas>
  );
}
