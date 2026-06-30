"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

// Pose: ingresso breve da 3/4 alto, poi vista quasi zenitale come nel reference.
const START_POS = new THREE.Vector3(0, 1.35, 2.35);
const START_TARGET = new THREE.Vector3(0, 0.08, 0);
// Posa finale dall'alto (~70° dall'orizzonte): il mazzo resta in alto-centro,
// lasciando spazio sul feltro davanti per la distribuzione a ventaglio (come nel
// reference). Camera più arretrata/alta → mazzo letto come oggetto fisico con un
// filo di spessore sul bordo, e tavolo visibile fin verso z≈1.3.
const END_POS = new THREE.Vector3(0, 3.5, 1.85);
const END_TARGET = new THREE.Vector3(0, 0.02, 0.5);

const DURATION = 0.95; // secondi
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const _pos = new THREE.Vector3();
const _tgt = new THREE.Vector3();

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

/**
 * Animazione d'ingresso della camera: glissa dalla posa iniziale a quella
 * dall'alto al montaggio della scena. Con prefers-reduced-motion salta diretto
 * alla posa finale. Non interferisce col resto: una volta concluso, smette di
 * scrivere sulla camera (l'utente non ha controlli orbitali).
 */
export function CameraIntro() {
  const { camera } = useThree();
  const reduced = usePrefersReducedMotion();
  const elapsed = useRef(0);
  const done = useRef(false);

  // Posa iniziale immediata (o finale se reduced-motion).
  useEffect(() => {
    if (reduced) {
      camera.position.copy(END_POS);
      camera.lookAt(END_TARGET);
      done.current = true;
    } else {
      camera.position.copy(START_POS);
      camera.lookAt(START_TARGET);
    }
  }, [camera, reduced]);

  useFrame((_, delta) => {
    if (done.current) return;
    elapsed.current += delta;
    const k = easeOut(Math.min(elapsed.current / DURATION, 1));
    _pos.lerpVectors(START_POS, END_POS, k);
    _tgt.lerpVectors(START_TARGET, END_TARGET, k);
    camera.position.copy(_pos);
    camera.lookAt(_tgt);
    if (k >= 1) done.current = true;
  });

  return null;
}
