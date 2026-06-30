"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { TOP_Y, TABLE_Y } from "./decks/cardModel";
import { initialCardControl } from "./decks/types";
import { ScatolinaMesh } from "./ScatolinaMesh";

// Catcher invisibile largo: cattura lo swipe da qualunque punto. Sta sopra tutto.
const CATCH_Y = TOP_Y + 0.06;
const CATCH_SIZE = 4;

// Bersaglio fuori campo: la scatola scivola verso l'osservatore (giù sullo
// schermo) e sparisce, lasciando il mazzo.
const OFF = new THREE.Vector3(0, -0.15, 3.4);

const CLAMP_X = 0.62;
const CLAMP_Z = 1.3;
const DRAG_THRESHOLD = 6;

const TABLE_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), -TABLE_Y);
const _ndc = new THREE.Vector2();
const _hit = new THREE.Vector3();

const DRAG_SPRING = 190;
const DRAG_DAMPING = 24;
const OFF_SPRING = 150;
const OFF_DAMPING = 22;

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

type ScatolinaProps = {
  /** Inizio del gesto sulla scatola: il gioco fissa l'istante (valore). */
  onGrab: () => void;
  /** Swipe completato: la scatola scivola fuori campo (valore confermato). */
  onReleased: () => void;
  /** Scatola uscita dallo schermo: si passa alla fase di gioco. */
  onExited: () => void;
};

/**
 * Scatolina aperta che contiene visivamente il mazzo reale (vista e camera
 * invariate). Si trascina come una carta — segue il dito sul piano del tavolo —
 * e al rilascio scivola fuori dallo schermo verso il basso. È solo scenografia
 * d'avvio: il mazzo interattivo vero resta quello sotto.
 */
export function Scatolina({ onGrab, onReleased, onExited }: ScatolinaProps) {
  const grp = useRef<THREE.Group>(null);
  const control = useRef(initialCardControl());
  const { camera, raycaster } = useThree();
  const gesture = useRef({
    pointerId: null as number | null,
    startX: 0,
    startY: 0,
    dragging: false,
  });
  const motion = useRef({
    target: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(),
    released: false,
    exited: false,
  });

  useFrame((_, delta) => {
    const g = grp.current;
    if (!g) return;
    const m = motion.current;
    const dt = Math.min(delta, 1 / 30);
    const clamp = THREE.MathUtils.clamp;

    if (m.released) {
      stepSpring(g.position, OFF, m.velocity, OFF_SPRING, OFF_DAMPING, dt);
      g.rotation.x = dampTo(g.rotation.x, -0.25, 10, dt);
      if (!m.exited && g.position.z > OFF.z - 0.25) {
        m.exited = true;
        onExited();
      }
      return;
    }

    const c = control.current;
    if (c.active) {
      _ndc.set(c.ndcX, c.ndcY);
      raycaster.setFromCamera(_ndc, camera);
      if (raycaster.ray.intersectPlane(TABLE_PLANE, _hit)) {
        m.target.set(
          clamp(_hit.x, -CLAMP_X, CLAMP_X),
          0,
          clamp(_hit.z, -CLAMP_Z, CLAMP_Z),
        );
        stepSpring(
          g.position,
          m.target,
          m.velocity,
          DRAG_SPRING,
          DRAG_DAMPING,
          dt,
        );
        const lagZ = m.target.z - g.position.z;
        g.rotation.x = dampTo(
          g.rotation.x,
          clamp(lagZ * 0.4, -0.18, 0.18),
          12,
          dt,
        );
      }
    } else {
      m.target.set(0, 0, 0);
      stepSpring(
        g.position,
        m.target,
        m.velocity,
        DRAG_SPRING,
        DRAG_DAMPING,
        dt,
      );
      g.rotation.x = dampTo(g.rotation.x, 0, 12, dt);
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (motion.current.released) return;
    const ge = gesture.current;
    ge.pointerId = e.pointerId;
    ge.startX = e.nativeEvent.clientX;
    ge.startY = e.nativeEvent.clientY;
    ge.dragging = false;
    control.current.ndcX = e.pointer.x;
    control.current.ndcY = e.pointer.y;
    (e.target as Element | undefined)?.setPointerCapture?.(e.pointerId);
    onGrab(); // istante scelto: i secondi del valore si fissano qui
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    const ge = gesture.current;
    if (ge.pointerId !== e.pointerId || motion.current.released) return;
    e.stopPropagation();
    const dx = e.nativeEvent.clientX - ge.startX;
    const dy = e.nativeEvent.clientY - ge.startY;
    if (!ge.dragging && Math.hypot(dx, dy) <= DRAG_THRESHOLD) return;
    ge.dragging = true;
    control.current.active = true;
    control.current.ndcX = e.pointer.x;
    control.current.ndcY = e.pointer.y;
  };

  const release = (e: ThreeEvent<PointerEvent>) => {
    (e.target as Element | undefined)?.releasePointerCapture?.(e.pointerId);
    const ge = gesture.current;
    const wasDragging = ge.dragging;
    ge.pointerId = null;
    ge.dragging = false;
    control.current.active = false;
    if (wasDragging && !motion.current.released) {
      motion.current.released = true;
      motion.current.velocity.set(0, 0, 0);
      onReleased();
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (gesture.current.pointerId !== e.pointerId) return;
    e.stopPropagation();
    release(e);
  };

  return (
    <group
      ref={grp}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handlePointerUp}
    >
      {/* Catcher invisibile: cattura lo swipe ovunque e scherma il mazzo. */}
      <mesh position={[0, CATCH_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CATCH_SIZE, CATCH_SIZE]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Astuccio aperto (geometria condivisa con la vista di debug). */}
      <ScatolinaMesh />
    </group>
  );
}
