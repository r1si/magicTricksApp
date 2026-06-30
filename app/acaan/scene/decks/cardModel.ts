// Modello geometrico condiviso del mazzo: una carta sottile con silhouette
// realmente arrotondata, così i fianchi del mazzo non restano squadrati.
import * as THREE from "three";

// Dimensioni carta (unità scena). Spessore su Y → pila lungo l'asse verticale.
// Rapporto W:H ≈ 0.697 = stesso aspetto dell'immagine del dorso (753×1081) per
// evitare deformazioni. Mazzo volutamente compatto: più spazio di manovra al drag.
export const CARD_W = 0.54;
// Spessore delle carte impilate: sottile, così 53 carte fanno un mazzo dall'altezza
// realistica (non un blocco). Le carte singole usano CARD_T_SINGLE (più spesse).
export const CARD_T = 0.0026; // ~ proporzioni reali del mazzo (54 carte)
// Spessore delle carte "singole" (quella che sfili e quelle distribuite): un filo
// più generoso del reale così il fianco del cartoncino si legge davvero in mano e
// durante il flip. Vale solo per le carte staccate dal mazzo, non per la pila.
export const CARD_T_SINGLE = 0.006;
export const CARD_H = 0.775;
const CARD_R = 0.046;
const CORNER_SEGMENTS = 8;

// Mazzo completo: 52 carte + 2 jolly + 1 carta bianca = 55. La carta in cima è
// la carta attiva (mesh separata); le altre stanno nel pile instanziato. Sfilando
// le carte il pile si abbassa, fino a sparire quando il mazzo è esaurito.
export const DECK_COUNT = 55;
// Numero massimo di carte nel pile instanziato (tutte tranne l'attiva in cima).
export const BODY_COUNT = DECK_COUNT - 1;

// Altezza della cima di un pile di `body` carte: lì riposa la carta attiva
// (spessa) appoggiata sulla pila sottile. Diminuisce man mano che il mazzo cala.
export function topYForBody(body: number): number {
  return Math.max(0, body) * CARD_T + CARD_T_SINGLE / 2;
}

// Cima del mazzo pieno (riferimento iniziale).
export const TOP_Y = topYForBody(BODY_COUNT);

// Quota d'appoggio della carta quando viene sfilata e poggiata sul feltro.
export const TABLE_Y = 0.012;

type Point2 = { x: number; z: number };

function roundedRectContour(): Point2[] {
  const hw = CARD_W / 2;
  const hh = CARD_H / 2;
  const r = Math.min(CARD_R, hw, hh);
  const contour: Point2[] = [];
  const arcs: Array<[number, number, number, number]> = [
    [hw - r, hh - r, 0, Math.PI / 2],
    [-hw + r, hh - r, Math.PI / 2, Math.PI],
    [-hw + r, -hh + r, Math.PI, Math.PI * 1.5],
    [hw - r, -hh + r, Math.PI * 1.5, Math.PI * 2],
  ];

  for (const [cx, cz, start, end] of arcs) {
    for (let i = 0; i <= CORNER_SEGMENTS; i++) {
      const t = start + ((end - start) * i) / CORNER_SEGMENTS;
      contour.push({ x: cx + Math.cos(t) * r, z: cz + Math.sin(t) * r });
    }
  }

  return contour;
}

function pushFaceVertex(
  positions: number[],
  normals: number[],
  uvs: number[],
  p: Point2,
  y: number,
  normalY: number,
) {
  positions.push(p.x, y, p.z);
  normals.push(0, normalY, 0);
  uvs.push((p.x + CARD_W / 2) / CARD_W, (p.z + CARD_H / 2) / CARD_H);
}

// Gruppi materiali: 0 = faccia +Y, 1 = faccia -Y, 2 = bordo carta.
// `thickness` di default = pila sottile; le carte singole passano CARD_T_SINGLE.
export function makeCardGeometry(
  thickness: number = CARD_T,
): THREE.BufferGeometry {
  const contour = roundedRectContour();
  const triangles = THREE.ShapeUtils.triangulateShape(
    contour.map((p) => new THREE.Vector2(p.x, p.z)),
    [],
  );
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const topY = thickness / 2;
  const bottomY = -thickness / 2;

  const topStart = 0;
  for (const p of contour) pushFaceVertex(positions, normals, uvs, p, topY, 1);
  const bottomStart = contour.length;
  for (const p of contour)
    pushFaceVertex(positions, normals, uvs, p, bottomY, -1);

  const topIndexStart = indices.length;
  for (const tri of triangles) {
    indices.push(topStart + tri[0], topStart + tri[2], topStart + tri[1]);
  }
  const topIndexCount = indices.length - topIndexStart;

  const bottomIndexStart = indices.length;
  for (const tri of triangles) {
    indices.push(
      bottomStart + tri[0],
      bottomStart + tri[1],
      bottomStart + tri[2],
    );
  }
  const bottomIndexCount = indices.length - bottomIndexStart;

  const sideIndexStart = indices.length;
  let distance = 0;
  const perimeter = contour.reduce((total, p, i) => {
    const next = contour[(i + 1) % contour.length];
    return total + Math.hypot(next.x - p.x, next.z - p.z);
  }, 0);

  for (let i = 0; i < contour.length; i++) {
    const p0 = contour[i];
    const p1 = contour[(i + 1) % contour.length];
    const dx = p1.x - p0.x;
    const dz = p1.z - p0.z;
    const length = Math.hypot(dx, dz);
    const nx = dz / length;
    const nz = -dx / length;
    const u0 = distance / perimeter;
    const u1 = (distance + length) / perimeter;
    const base = positions.length / 3;

    positions.push(p0.x, topY, p0.z, p1.x, topY, p1.z);
    positions.push(p0.x, bottomY, p0.z, p1.x, bottomY, p1.z);
    normals.push(nx, 0, nz, nx, 0, nz, nx, 0, nz, nx, 0, nz);
    uvs.push(u0, 1, u1, 1, u0, 0, u1, 0);
    indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);

    distance += length;
  }
  const sideIndexCount = indices.length - sideIndexStart;

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3),
  );
  geometry.setAttribute(
    "normal",
    new THREE.BufferAttribute(new Float32Array(normals), 3),
  );
  geometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(new Float32Array(uvs), 2),
  );
  geometry.setIndex(indices);
  geometry.addGroup(topIndexStart, topIndexCount, 0);
  geometry.addGroup(bottomIndexStart, bottomIndexCount, 1);
  geometry.addGroup(sideIndexStart, sideIndexCount, 2);
  geometry.computeBoundingSphere();
  return geometry;
}

// Dispone le BODY_COUNT carte impilate lungo Y in una InstancedMesh.
export function fillPileMatrices(mesh: THREE.InstancedMesh): void {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3(1, 1, 1);
  const yAxis = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < BODY_COUNT; i++) {
    const n = i / Math.max(BODY_COUNT - 1, 1);
    const x = Math.sin(i * 1.71) * 0.0014 * (1 - n * 0.35);
    const z = Math.cos(i * 1.37) * 0.0017 * (1 - n * 0.35);
    const yaw = Math.sin(i * 0.83) * 0.0045;
    p.set(x, i * CARD_T + CARD_T / 2, z);
    q.setFromAxisAngle(yAxis, yaw);
    m.compose(p, q, s);
    mesh.setMatrixAt(i, m);
  }
  mesh.instanceMatrix.needsUpdate = true;
}
