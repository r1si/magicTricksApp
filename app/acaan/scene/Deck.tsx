"use client";

import {
  Suspense,
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { createEdgeTexture, roundedAlphaTexture } from "./cardTextures";
import { ActiveCard } from "./ActiveCard";
import { DealtCard } from "./DealtCard";
import {
  BODY_COUNT,
  CARD_T_SINGLE,
  TABLE_Y,
  fillPileMatrices,
  makeCardGeometry,
  topYForBody,
} from "./decks/cardModel";
import type { Card } from "@/lib/cards";
import type {
  CardControl,
  CardXform,
  DealtCard as DealtCardData,
} from "./decks/types";

// Dorso fornito dall'utente (rider-back blu). Stesso dominio → CSP-safe.
const BACK_URL = "/cards/backCard.png";

// Ordine gruppi makeCardGeometry: faccia +Y, faccia -Y, bordo arrotondato.
type Mats = THREE.Material[];

type DeckProps = {
  /** Carte distribuite sul tavolo (a dorso finché non le giri). */
  dealt: DealtCardData[];
  /** Stato del drag della carta attiva (ref, no re-render). */
  control: RefObject<CardControl>;
  /** Posa corrente della carta attiva (scritta dalla scena, letta al deal). */
  activeXform: RefObject<CardXform>;
  /** Cambia a ogni nuova carta distribuita → rimonta la carta attiva in cima. */
  activeKey: number;
  /** Carte ancora nel mazzo (attiva inclusa). 0 → mazzo esaurito, niente cima. */
  remaining: number;
  /** Faccia rivelata della carta in cima al mazzo (null finché a dorso). */
  topFace: Card | null;
  /** True quando la carta in cima è stata girata. */
  topRevealed: boolean;
  onDeal: (pose: CardXform) => void;
  onRevealCard: (id: number) => void;
  /** Doppio tap sulla carta in cima: chiede di girarla in posa. */
  onRevealTop: () => void;
  /** Pressione sulla carta in cima: uv 0..1 del punto toccato. */
  onPointerDownInfo: (info: { u: number; v: number }) => void;
  /** Carte uscite dallo schermo: la scena le rimuove (performance). */
  onCull: (ids: number[]) => void;
};

function FotoDeck({
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
}: DeckProps) {
  // Pila: carte sottili (mazzo realistico). Carte singole: più spesse, così il
  // fianco del cartoncino si vede mentre le sfili/giri.
  const pileGeometry = useMemo(() => makeCardGeometry(), []);
  const cardGeometry = useMemo(() => makeCardGeometry(CARD_T_SINGLE), []);
  const alpha = useMemo(() => roundedAlphaTexture(), []);
  const backImg = useTexture(BACK_URL, (t) => {
    const tex = Array.isArray(t) ? t[0] : t;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  });

  const edge = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: createEdgeTexture(),
        roughness: 0.68,
        metalness: 0.02,
      }),
    [],
  );
  const backMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: backImg,
        alphaMap: alpha,
        alphaTest: 0.35,
        roughness: 0.48,
        metalness: 0.03,
        envMapIntensity: 0.45,
      }),
    [backImg, alpha],
  );
  // Materiale del dorso della PILA: opaco ed economico (Lambert, niente PBR né
  // riflessi environment) e SENZA alphaTest. La pila è quasi tutta nascosta sotto
  // la carta attiva e, dalla vista dall'alto, le 54 carte si sovrappongono: con
  // alphaTest la GPU non può scartare i frammenti nascosti (niente early-z) e
  // ombreggia tutti gli strati → crollo di fps. Il contorno arrotondato lo dà già
  // la geometria, quindi l'alphaMap qui è superflua.
  const pileBack = useMemo(
    () => new THREE.MeshLambertMaterial({ map: backImg }),
    [backImg],
  );
  // Pila: dorso opaco economico sulle due facce + bordo.
  const pileMaterials = useMemo<Mats>(
    () => [pileBack, pileBack, edge],
    [edge, pileBack],
  );

  const instRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (instRef.current) fillPileMatrices(instRef.current);
  }, [pileGeometry]);

  // Carte ancora nel pile (tutte tranne l'attiva in cima) e quota della cima:
  // scendono man mano che sfili le carte; a 0 il mazzo è sparito.
  const bodyCount = Math.max(remaining - 1, 0);
  const baseY = topYForBody(bodyCount);

  // Culling: ogni ~0.5s proietta le carte distribuite e segnala quelle uscite
  // dallo schermo, così la scena le rimuove (con 55 carte aiuta le performance).
  const { camera } = useThree();
  const cullTimer = useRef(0);
  const cullVec = useRef(new THREE.Vector3());
  useFrame((_, delta) => {
    cullTimer.current += delta;
    if (cullTimer.current < 0.5 || dealt.length === 0) return;
    cullTimer.current = 0;
    const gone: number[] = [];
    for (const d of dealt) {
      cullVec.current.set(d.x, TABLE_Y, d.z).project(camera);
      if (
        Math.abs(cullVec.current.x) > 1.15 ||
        Math.abs(cullVec.current.y) > 1.15
      ) {
        gone.push(d.id);
      }
    }
    if (gone.length) onCull(gone);
  });

  return (
    <group>
      <instancedMesh
        ref={instRef}
        args={[pileGeometry, pileMaterials, BODY_COUNT]}
        count={bodyCount}
        frustumCulled={false}
      />

      {dealt.map((d, i) => (
        <DealtCard
          key={d.id}
          geometry={cardGeometry}
          backMat={backMat}
          edge={edge}
          alpha={alpha}
          face={d.face}
          x={d.x}
          z={d.z}
          rotZ={d.rotZ}
          lift={i * 0.0016}
          revealed={d.revealed}
          onReveal={() => onRevealCard(d.id)}
        />
      ))}

      {remaining > 0 && (
        <ActiveCard
          key={activeKey}
          geometry={cardGeometry}
          baseY={baseY}
          backMat={backMat}
          edge={edge}
          alpha={alpha}
          face={topFace}
          revealed={topRevealed}
          control={control}
          xformRef={activeXform}
          onDeal={onDeal}
          onRevealTop={onRevealTop}
          onPointerDownInfo={onPointerDownInfo}
        />
      )}
    </group>
  );
}

/**
 * Mazzo 3D (stile "Foto": dorso a immagine reale, facce procedurali). L'immagine
 * del dorso è caricata in Suspense; le luci base montate da DeckScene tengono la
 * scena visibile nel frattempo.
 */
export function Deck(props: DeckProps) {
  return (
    <Suspense fallback={null}>
      <FotoDeck {...props} />
    </Suspense>
  );
}
