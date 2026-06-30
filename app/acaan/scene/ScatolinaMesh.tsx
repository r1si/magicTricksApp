"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { CARD_W, CARD_H, TOP_Y } from "./decks/cardModel";

// Scatola di carte (tuck box) aperta, modellata sul reference:
//  • PANNELLO superiore avorio che copre il mazzo (la "copertura sopra"), con
//    angoli arrotondati sul lato chiuso e INTAGLIO del pollice sul bordo apertura;
//  • COPERTURA ad arco ("lapide") incernierata sul RETRO/fondo (-Z) e ribaltata
//    aperta, adagiata sul feltro dietro la scatola;
//  • due LINGUETTE sottili (dust flap) agli angoli dell'apertura, aperte a ~45°.
// Solo la cima del mazzo fa capolino dall'apertura/intaglio, come una scatola vera.
// Geometria centrata sull'origine. Y=0 = piano del tavolo. Apertura verso -Z.

const MARGIN_X = 0.03;
const MARGIN_Z = 0.035;
const HALF_X = CARD_W / 2 + MARGIN_X;
const HALF_Z = CARD_H / 2 + MARGIN_Z;
const BOX_W = 2 * HALF_X;
const BOX_D = 2 * HALF_Z;
const WALL_T = 0.013;
const PANEL_T = 0.009;
const BASE_T = 0.012;
// Il pannello superiore corre appena sopra la cima del mazzo.
const CASE_TOP_Y = TOP_Y + 0.014;

// Pannello superiore e apertura.
const OPENING_LEN = 0.1; // banda scoperta al lato -Z (apertura)
const COVER_LEN = BOX_D - OPENING_LEN; // profondità del pannello
const PANEL_R = 0.04; // angoli arrotondati del lato chiuso
const NOTCH_R = 0.085; // intaglio del pollice sul bordo dell'apertura

// Copertura ad arco pieno, incernierata sul fondo/retro e adagiata a terra.
const LID_W = BOX_W * 0.84;
const LID_STRAIGHT = 0.05;
const LID_TILT = 0.06; // rad sopra il piano (0 = adagiata a terra)
const LID_HINGE_Y = 0.004;

// Linguette laterali (dust flap): sottili, all'apertura, aperte a ~45°.
const TAB_W = 0.018;
const TAB_H = 0.13;
const TAB_R = 0.009;
const TAB_Z = -HALF_Z + 0.03;
const TAB_LIFT = 0.34; // quanto si sollevano dal piano (rad)
const TAB_SPLAY = Math.PI / 4; // divaricazione verso l'esterno (45°)

const ARC = 24;

function quarter(
  s: THREE.Shape,
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
) {
  for (let i = 1; i <= 8; i++) {
    const a = a0 + (a1 - a0) * (i / 8);
    s.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
}

// Pannello superiore: rettangolo con angoli arrotondati sul lato chiuso (y=0) e,
// sul bordo dell'apertura (y=COVER_LEN), l'intaglio semicircolare del pollice.
// Shape in XY (x = larghezza, y = profondità), estrusa e poi adagiata.
function makeTopPanelGeometry(): THREE.BufferGeometry {
  const hw = BOX_W / 2;
  const r = PANEL_R;
  const L = COVER_LEN;
  const s = new THREE.Shape();
  s.moveTo(-hw, L); // bordo apertura, sinistra
  s.lineTo(-hw, r);
  quarter(s, -hw + r, r, r, Math.PI, Math.PI * 1.5); // angolo chiuso SX
  s.lineTo(hw - r, 0);
  quarter(s, hw - r, r, r, Math.PI * 1.5, Math.PI * 2); // angolo chiuso DX
  s.lineTo(hw, L); // bordo apertura, destra
  s.lineTo(NOTCH_R, L);
  for (let i = 1; i <= ARC; i++) {
    const a = (Math.PI * i) / ARC; // intaglio: rientra dal bordo apertura
    s.lineTo(Math.cos(a) * NOTCH_R, L - Math.sin(a) * NOTCH_R);
  }
  s.lineTo(-hw, L);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: PANEL_T,
    bevelEnabled: false,
  });
  geo.computeVertexNormals();
  return geo;
}

// Copertura ad arco pieno. Shape in XY, hinge a y=0.
function makeLidGeometry(): THREE.BufferGeometry {
  const hw = LID_W / 2;
  const s = new THREE.Shape();
  s.moveTo(-hw, 0);
  s.lineTo(-hw, LID_STRAIGHT);
  for (let i = 1; i <= ARC; i++) {
    const a = Math.PI - (Math.PI * i) / ARC; // π..0 → cupola verso l'alto
    s.lineTo(Math.cos(a) * hw, LID_STRAIGHT + Math.sin(a) * hw);
  }
  s.lineTo(hw, 0);
  s.lineTo(-hw, 0);
  return new THREE.ShapeGeometry(s);
}

// Linguetta sottile ad angoli arrotondati, hinge a y=0.
function makeTabGeometry(): THREE.BufferGeometry {
  const hw = TAB_W / 2;
  const r = Math.min(TAB_R, hw, TAB_H / 2);
  const s = new THREE.Shape();
  s.moveTo(-hw, 0);
  s.lineTo(hw, 0);
  s.lineTo(hw, TAB_H - r);
  quarter(s, hw - r, TAB_H - r, r, 0, Math.PI / 2);
  quarter(s, -hw + r, TAB_H - r, r, Math.PI / 2, Math.PI);
  s.lineTo(-hw, 0);
  return new THREE.ShapeGeometry(s);
}

/**
 * Solo la geometria dell'astuccio (nessuna interazione): la usano sia la scena
 * di gioco (dentro <Scatolina>, trascinabile) sia la vista di debug (?debug=box).
 */
export function ScatolinaMesh() {
  const cardboard = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f3efe6", // avorio caldo (tema "cornice avorio")
        roughness: 0.85,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const paper = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#efe9dd",
        roughness: 0.9,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const topPanel = useMemo(() => makeTopPanelGeometry(), []);
  const lid = useMemo(() => makeLidGeometry(), []);
  const tab = useMemo(() => makeTabGeometry(), []);

  return (
    <group>
      {/* Fondo dell'astuccio (sotto il mazzo). */}
      <mesh position={[0, -BASE_T / 2, 0]} material={cardboard}>
        <boxGeometry args={[BOX_W, BASE_T, BOX_D]} />
      </mesh>

      {/* Pareti lunghe (sinistra/destra) → spessore visibile dell'astuccio. */}
      <mesh
        position={[-(HALF_X - WALL_T / 2), CASE_TOP_Y / 2, 0]}
        material={cardboard}
      >
        <boxGeometry args={[WALL_T, CASE_TOP_Y, BOX_D]} />
      </mesh>
      <mesh
        position={[HALF_X - WALL_T / 2, CASE_TOP_Y / 2, 0]}
        material={cardboard}
      >
        <boxGeometry args={[WALL_T, CASE_TOP_Y, BOX_D]} />
      </mesh>

      {/* Parete chiusa (lato +Z, vicino alla camera). */}
      <mesh
        position={[0, CASE_TOP_Y / 2, HALF_Z - WALL_T / 2]}
        material={cardboard}
      >
        <boxGeometry args={[BOX_W, CASE_TOP_Y, WALL_T]} />
      </mesh>

      {/* Pannello superiore avorio con intaglio: copre il mazzo. */}
      <mesh
        geometry={topPanel}
        material={cardboard}
        position={[0, CASE_TOP_Y, HALF_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Copertura ad arco incernierata sul retro e adagiata sul feltro. */}
      <mesh
        geometry={lid}
        material={paper}
        position={[0, LID_HINGE_Y, -HALF_Z]}
        rotation={[-Math.PI / 2 + LID_TILT, 0, 0]}
      />

      {/* Linguette sottili all'apertura, aperte a ~45° verso l'esterno. */}
      <mesh
        geometry={tab}
        material={paper}
        position={[-(HALF_X - WALL_T / 2), CASE_TOP_Y, TAB_Z]}
        rotation={[-Math.PI / 2 + TAB_LIFT, TAB_SPLAY, 0]}
      />
      <mesh
        geometry={tab}
        material={paper}
        position={[HALF_X - WALL_T / 2, CASE_TOP_Y, TAB_Z]}
        rotation={[-Math.PI / 2 + TAB_LIFT, -TAB_SPLAY, 0]}
      />
    </group>
  );
}
