// Texture procedurali delle FACCE delle carte (CanvasTexture) — niente asset di
// rete: offline-native, nitide a ogni risoluzione, nessun flash di caricamento.
// Il DORSO usa invece l'immagine reale /public/cards/backCard.png (vedi Deck).
import * as THREE from "three";
import { type Card, type Suit, valueLabel, isRedSuit } from "@/lib/cards";

const W = 512;
const H = 735; // aspetto carta ≈ 0.697 (coerente col dorso a immagine)

const IVORY = "#f3ecdb";
const WINE = "#7e2030";
const FELT = "#0e4d34";
const GOLD = "#dca12c";

const SUIT_GLYPH: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

function newCanvas(w = W, h = H): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function finalize(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

/** Faccia di una carta (qualsiasi valore o jolly), disegnata su misura. */
export function createFaceTexture(card: Card): THREE.CanvasTexture {
  const c = newCanvas();
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = IVORY;
  ctx.fillRect(0, 0, W, H);

  // Niente cornice interna sulla faccia: il bordo bianco resta solo sul dorso.
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Carta bianca: faccia non stampata, solo il cartoncino. Niente indici né pip.
  if (card.value === "blank") {
    return finalize(c);
  }

  if (card.value === "joker") {
    ctx.fillStyle = GOLD;
    ctx.font = "bold 96px Georgia, serif";
    ctx.fillText("★", W / 2, H / 2 - 70);
    ctx.fillStyle = FELT;
    ctx.font = "bold 64px Georgia, serif";
    ctx.fillText("JOLLY", W / 2, H / 2 + 70);
    return finalize(c);
  }

  const color = isRedSuit(card.suit) ? WINE : FELT;
  const glyph = SUIT_GLYPH[card.suit];
  const rank = valueLabel(card.value);
  ctx.fillStyle = color;

  const drawIndex = () => {
    ctx.font = "bold 76px Georgia, serif";
    ctx.fillText(rank, 72, 82);
    ctx.font = "52px Georgia, serif";
    ctx.fillText(glyph, 72, 154);
  };
  drawIndex();
  ctx.save();
  ctx.translate(W, H);
  ctx.rotate(Math.PI);
  drawIndex(); // indice speculare in basso a destra
  ctx.restore();

  // Pip centrale grande.
  ctx.font = "bold 300px Georgia, serif";
  ctx.fillText(glyph, W / 2, H / 2 + 24);

  return finalize(c);
}

let edgeCache: THREE.CanvasTexture | null = null;

/**
 * Texture del FIANCO della carta (spessore). Bianco-avorio del cartoncino con
 * una riga sottile più scura sul bordo: impilando 53 carte le righe creano la
 * "rigatura" del mazzo (sembra una pila di carte, non un blocco pieno).
 * Mappata 0..1 su ogni singola carta → una riga per carta.
 */
export function createEdgeTexture(): THREE.CanvasTexture {
  if (edgeCache) return edgeCache;
  const w = 8;
  const h = 64;
  const c = newCanvas(w, h);
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#f6f2e8");
  g.addColorStop(1, "#e9e0cf");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Riga di separazione tra una carta e l'altra (sul bordo della texture).
  ctx.fillStyle = "rgba(120,104,78,0.45)";
  ctx.fillRect(0, h - 2, w, 1.5);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  edgeCache = t;
  return t;
}

let alphaCache: THREE.CanvasTexture | null = null;

/**
 * Maschera alpha per angoli arrotondati (cutout): bianco = opaco, nero =
 * trasparente. Usata come `alphaMap` + `alphaTest` per dare alle carte la
 * silhouette arrotondata reale anche con una semplice BoxGeometry.
 */
export function roundedAlphaTexture(): THREE.CanvasTexture {
  if (alphaCache) return alphaCache;
  const c = newCanvas();
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(6, 6, W - 12, H - 12, 46);
  ctx.fill();
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  alphaCache = t;
  return t;
}
