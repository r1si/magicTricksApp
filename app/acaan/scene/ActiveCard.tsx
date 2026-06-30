"use client";

import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { animated } from "@react-spring/three";
import type { Card } from "@/lib/cards";
import { TABLE_Y, CARD_W, CARD_H } from "./decks/cardModel";
import { useFaceMaterial, useFlip } from "./flip";
import type { CardControl, CardXform } from "./decks/types";

// Piano orizzontale del tavolo su cui la carta scivola quando viene sfilata.
const TABLE_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), -TABLE_Y);
// Riquadro entro cui la carta resta inquadrata mentre segue il dito.
const CLAMP_X = 0.62;
const CLAMP_Z_NEAR = 1.15; // verso l'osservatore (zona di distribuzione)
const CLAMP_Z_FAR = -0.7; // lontano (drag verso l'alto)
const DRAG_THRESHOLD = 6;
const DOUBLE_TAP_MS = 320;

// Quote della carta sfilata: "appoggiata in cima al mazzo" → "che plana sul feltro".
// La quota d'appoggio sopra la pila è `baseY + REST_GAP` (baseY scende col mazzo).
const REST_GAP = 0.016; // sopra la pila (nessuna compenetrazione)
const GLIDE_Y = TABLE_Y + 0.05; // plana appena sopra il feltro e le carte già date
// Dopo che la carta ha SUPERATO l'impronta del mazzo, in questo tratto scende sul
// feltro. Finché c'è sovrapposizione col mazzo resta a REST_Y → niente clipping.
const DROP_SPAN = 0.16;
// Soglia di "carta sfilata davvero": il punto di rilascio (dito) ha superato del
// tutto l'impronta del mazzo. >= 0 → distribuzione; altrimenti la carta torna in
// cima. Decisa sul punto del dito (non sulla carta, che insegue con un po' di
// ritardo elastico), così basta una tirata netta — niente compenetrazione perché
// la carta posata è già fuori dal mazzo.
const DEAL_CLEARANCE = 0;

const _ndc = new THREE.Vector2();
const _hit = new THREE.Vector3();

const DRAG_SPRING = 190;
const DRAG_DAMPING = 24;
const HOME_SPRING = 120;
const HOME_DAMPING = 20;

const dampTo = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));

function stepSpring(
  position: THREE.Vector3,
  target: THREE.Vector3,
  velocity: THREE.Vector3,
  spring: number,
  damping: number,
  dt: number,
) {
  velocity.x += ((target.x - position.x) * spring - velocity.x * damping) * dt;
  velocity.y += ((target.y - position.y) * spring - velocity.y * damping) * dt;
  velocity.z += ((target.z - position.z) * spring - velocity.z * damping) * dt;
  position.x += velocity.x * dt;
  position.y += velocity.y * dt;
  position.z += velocity.z * dt;
}

// Distanza con segno dall'impronta del mazzo (asse separatore di due rettangoli
// uguali): < 0 → la carta è ancora sopra/sovrapposta al mazzo; >= 0 → l'ha
// superato del tutto. Mazzo e carta hanno la stessa pianta, quindi la somma dei
// semilati vale CARD_W (x) e CARD_H (z).
function deckClearance(x: number, z: number) {
  return Math.max(Math.abs(x) - CARD_W, Math.abs(z) - CARD_H);
}

function setControlPointer(control: CardControl, x: number, y: number) {
  control.ndcX = x;
  control.ndcY = y;
}

function startControlDrag(control: CardControl, x: number, y: number) {
  control.active = true;
  setControlPointer(control, x, y);
}

function stopControlDrag(control: CardControl) {
  control.active = false;
}

type ActiveCardProps = {
  geometry: THREE.BufferGeometry;
  /** Quota di riposo in cima alla pila corrente (scende man mano che il mazzo cala). */
  baseY: number;
  /** Materiali condivisi: dorso (su +Y) e bordo carta. */
  backMat: THREE.Material;
  edge: THREE.Material;
  /** Maschera angoli arrotondati per la faccia rivelata. */
  alpha: THREE.Texture;
  /** Faccia mostrata quando la carta in cima viene girata (null finché a dorso). */
  face: Card | null;
  /** True quando la carta in cima è stata girata: parte il flip in posa. */
  revealed: boolean;
  control: RefObject<CardControl>;
  /** La scena scrive qui la posa corrente (per archiviare la carta al deal). */
  xformRef?: RefObject<CardXform>;
  /** Carta sfilata e lasciata sul feltro: la scena la archivia come distribuita. */
  onDeal: (pose: CardXform) => void;
  /** Doppio tap sulla carta in cima (senza trascinarla): chiede di girarla. */
  onRevealTop: () => void;
  /**
   * Pressione sulla carta in cima: riporta dove (uv 0..1) è stata toccata, così
   * il gioco può fissare il seme dal quadrante della carta (modalità "carta").
   */
  onPointerDownInfo: (info: { u: number; v: number }) => void;
};

/**
 * Carta attiva in cima al mazzo, indipendente dalla grafica (riceve la mesh come
 * `children`, sempre a dorso). Comportamenti:
 * - Drag realistico: il puntatore viene proiettato sul piano del tavolo e la
 *   carta vi scivola seguendo il dito, con leggera inclinazione.
 * - **Anti-compenetrazione**: finché la carta è sopra l'impronta del mazzo resta
 *   alla quota della cima della pila E piatta (nessuna inclinazione che farebbe
 *   affondare gli spigoli nel mazzo); solo dopo averlo superato plana sul feltro
 *   inclinandosi.
 * - **Distribuzione**: se la rilasci dopo averla sfilata dal mazzo viene
 *   archiviata lì (a dorso) e una nuova carta sale in cima; se la rilasci ancora
 *   sopra il mazzo torna in cima senza distribuire.
 * - **Flip in cima**: doppio tap (senza trascinare) → la carta si alza, gira di
 *   lato e mostra la sua faccia restando in cima al mazzo.
 */
export function ActiveCard({
  geometry,
  baseY,
  backMat,
  edge,
  alpha,
  face,
  revealed,
  control,
  xformRef,
  onDeal,
  onRevealTop,
  onPointerDownInfo,
}: ActiveCardProps) {
  const dragRef = useRef<THREE.Group>(null);
  const motionRef = useRef({
    restYaw: 0,
    target: new THREE.Vector3(0, baseY, 0),
    velocity: new THREE.Vector3(),
    wasActive: false,
  });
  const gestureRef = useRef({
    pointerId: null as number | null,
    startX: 0,
    startY: 0,
    dragging: false,
    lastTap: 0,
  });
  const { camera, raycaster } = useThree();

  // Dorso sul +Y, faccia sul −Y (emerge col flip attorno all'asse lungo).
  const faceMat = useFaceMaterial(face, backMat, alpha);
  const materials = useMemo<THREE.Material[]>(
    () => [backMat, faceMat, edge],
    [backMat, faceMat, edge],
  );
  const { hop, flip } = useFlip(revealed);

  useFrame((_, delta) => {
    const g = dragRef.current;
    if (!g) return;
    const c = control.current;
    const clamp = THREE.MathUtils.clamp;
    const dt = Math.min(delta, 1 / 30);
    const motion = motionRef.current;

    if (motion.wasActive && !c.active) {
      motion.restYaw = clamp(
        g.rotation.y - motion.velocity.x * 0.018 + motion.velocity.z * 0.006,
        -0.2,
        0.2,
      );
      motion.velocity.multiplyScalar(0.72);
    }
    motion.wasActive = c.active;

    if (c.active) {
      // Segui il dito: proietta l'NDC sul piano del tavolo.
      _ndc.set(c.ndcX, c.ndcY);
      raycaster.setFromCamera(_ndc, camera);
      if (raycaster.ray.intersectPlane(TABLE_PLANE, _hit)) {
        const tx = clamp(_hit.x, -CLAMP_X, CLAMP_X);
        const tz = clamp(_hit.z, CLAMP_Z_FAR, CLAMP_Z_NEAR);
        // Quota anti-clip: alla cima della pila corrente finché sovrapposta al
        // mazzo, poi plana sul feltro.
        const clearance = deckClearance(tx, tz);
        const drop = clamp(clearance / DROP_SPAN, 0, 1);
        const lift = THREE.MathUtils.lerp(baseY + REST_GAP, GLIDE_Y, drop);
        motion.target.set(tx, lift, tz);
        stepSpring(
          g.position,
          motion.target,
          motion.velocity,
          DRAG_SPRING,
          DRAG_DAMPING,
          dt,
        );

        const lagX = motion.target.x - g.position.x;
        const lagZ = motion.target.z - g.position.z;
        // Inclinazione scalata da `drop`: sopra il mazzo (drop=0) la carta resta
        // piatta — così gli spigoli non affondano nella pila — e comincia a
        // inclinarsi solo quando ne ha superato l'impronta.
        const roll =
          clamp(-motion.velocity.x * 0.045 - lagX * 0.42, -0.24, 0.24) * drop;
        const pitch =
          clamp(motion.velocity.z * 0.035 + lagZ * 0.26, -0.16, 0.16) * drop;
        const yaw = clamp(
          motion.restYaw -
            motion.velocity.x * 0.018 +
            motion.velocity.z * 0.006,
          -0.2,
          0.2,
        );
        g.rotation.x = dampTo(g.rotation.x, pitch, 13, dt);
        g.rotation.y = dampTo(g.rotation.y, yaw, 10, dt);
        g.rotation.z = dampTo(g.rotation.z, roll, 13, dt);
      }
    } else {
      // A riposo / ritorno: la carta attiva sta sempre in cima al mazzo.
      motion.restYaw = 0;
      motion.target.set(0, baseY, 0);
      stepSpring(
        g.position,
        motion.target,
        motion.velocity,
        HOME_SPRING,
        HOME_DAMPING,
        dt,
      );
      g.rotation.x = dampTo(g.rotation.x, 0, 14, dt);
      g.rotation.y = dampTo(g.rotation.y, 0, 14, dt);
      g.rotation.z = dampTo(g.rotation.z, 0, 14, dt);
    }

    if (xformRef?.current) {
      xformRef.current.x = g.position.x;
      xformRef.current.z = g.position.z;
      xformRef.current.rotZ = g.rotation.y;
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    // Anche da girata la carta resta trascinabile: dopo aver mostrato la carta
    // scelta si può sfilarla per esibire che le altre sono tutte diverse. Il
    // doppio tap, invece, non la rigira (onRevealTop è idempotente).
    const g = gestureRef.current;
    g.pointerId = e.pointerId;
    g.startX = e.nativeEvent.clientX;
    g.startY = e.nativeEvent.clientY;
    g.dragging = false;

    // Quadrante della carta (modalità "carta"): dove l'ho toccata, in uv 0..1.
    if (e.uv) onPointerDownInfo({ u: e.uv.x, v: e.uv.y });

    setControlPointer(control.current, e.pointer.x, e.pointer.y);

    const target = e.target as Element | undefined;
    target?.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    const g = gestureRef.current;
    if (g.pointerId !== e.pointerId) return;
    e.stopPropagation();

    const dx = e.nativeEvent.clientX - g.startX;
    const dy = e.nativeEvent.clientY - g.startY;
    if (!g.dragging && Math.hypot(dx, dy) <= DRAG_THRESHOLD) return;

    g.dragging = true;
    startControlDrag(control.current, e.pointer.x, e.pointer.y);
  };

  const releasePointer = (e: ThreeEvent<PointerEvent>) => {
    const target = e.target as Element | undefined;
    target?.releasePointerCapture?.(e.pointerId);
    const g = gestureRef.current;
    const wasDragging = g.dragging;
    g.pointerId = null;
    g.dragging = false;
    stopControlDrag(control.current);

    const grp = dragRef.current;
    if (!grp) return;

    // Tap (nessun trascinamento): conta il doppio tap → gira la carta in cima.
    if (!wasDragging) {
      const now = e.nativeEvent.timeStamp;
      if (now - g.lastTap < DOUBLE_TAP_MS) {
        g.lastTap = 0;
        onRevealTop();
      } else {
        g.lastTap = now;
      }
      return;
    }

    // Punto di rilascio sul tavolo (proiezione del dito, senza il ritardo della
    // carta): se è fuori dall'impronta del mazzo → distribuzione, e la carta si
    // posa lì (già libera dalla pila, quindi senza compenetrazioni).
    const clamp = THREE.MathUtils.clamp;
    const c = control.current;
    _ndc.set(c.ndcX, c.ndcY);
    raycaster.setFromCamera(_ndc, camera);
    if (!raycaster.ray.intersectPlane(TABLE_PLANE, _hit)) return;
    const tx = clamp(_hit.x, -CLAMP_X, CLAMP_X);
    const tz = clamp(_hit.z, CLAMP_Z_FAR, CLAMP_Z_NEAR);
    if (deckClearance(tx, tz) >= DEAL_CLEARANCE) {
      onDeal({ x: tx, z: tz, rotZ: grp.rotation.y });
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (gestureRef.current.pointerId !== e.pointerId) return;
    e.stopPropagation();
    releasePointer(e);
  };

  const handlePointerCancel = (e: ThreeEvent<PointerEvent>) => {
    if (gestureRef.current.pointerId !== e.pointerId) return;
    e.stopPropagation();
    releasePointer(e);
  };

  return (
    <group
      ref={dragRef}
      position={[0, baseY, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handlePointerCancel}
    >
      <animated.group position-y={hop} rotation-z={flip}>
        <mesh geometry={geometry} material={materials} />
      </animated.group>
    </group>
  );
}
