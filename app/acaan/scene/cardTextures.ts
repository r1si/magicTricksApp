// Texture procedurali delle carte (CanvasTexture) — niente asset di rete:
// offline-native, nitide a ogni risoluzione, nessun flash di caricamento.
// TODO futuro (specs §6.3): passaggio a un texture atlas (sprite sheet) se il
// numero di facce da mostrare contemporaneamente dovesse crescere.
import * as THREE from "three";
import { type Card, type Suit, valueLabel, isRedSuit } from "@/lib/cards";

const W = 512;
const H = 712; // ~ aspetto carta 0.64:0.89

const ROYAL = "#2e3d9e";
const ROYAL_DK = "#27358a";
const IVORY = "#f3ecdb";
const IVORY_LINE = "rgba(243,236,219,0.9)";
const WINE = "#7e2030";
const FELT = "#0e4d34";
const GOLD = "#dca12c";

const SUIT_GLYPH: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

function newCanvas(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  return c;
}

function finalize(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

let backCache: THREE.CanvasTexture | null = null;

/** Dorso blu classico (stile Bicycle): reticolo + cornice avorio + emblema. */
export function createBackTexture(): THREE.CanvasTexture {
  if (backCache) return backCache;
  const c = newCanvas();
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = ROYAL;
  ctx.fillRect(0, 0, W, H);

  const m = 26;
  ctx.fillStyle = ROYAL_DK;
  ctx.beginPath();
  ctx.roundRect(m, m, W - 2 * m, H - 2 * m, 28);
  ctx.fill();

  // Reticolo incrociato, clippato al pannello interno.
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(m + 10, m + 10, W - 2 * (m + 10), H - 2 * (m + 10), 20);
  ctx.clip();
  ctx.strokeStyle = "rgba(243,236,219,0.12)";
  ctx.lineWidth = 3;
  for (let i = -H; i < W + H; i += 22) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i - H, H);
    ctx.stroke();
  }
  ctx.restore();

  // Cornice avorio.
  ctx.strokeStyle = IVORY_LINE;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(m, m, W - 2 * m, H - 2 * m, 28);
  ctx.stroke();

  // Emblema centrale: rombo + picca.
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.strokeStyle = IVORY_LINE;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, -96);
  ctx.lineTo(74, 0);
  ctx.lineTo(0, 96);
  ctx.lineTo(-74, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = IVORY;
  ctx.font = "bold 92px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("♠", 0, 6);
  ctx.restore();

  backCache = finalize(c);
  return backCache;
}

/** Faccia di una carta (qualsiasi valore o jolly), disegnata su misura. */
export function createFaceTexture(card: Card): THREE.CanvasTexture {
  const c = newCanvas();
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = IVORY;
  ctx.fillRect(0, 0, W, H);

  // Keyline interno (cornice avorio del brand).
  ctx.strokeStyle = "rgba(14,77,52,0.22)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(20, 20, W - 40, H - 40, 26);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

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
    ctx.font = "bold 72px Georgia, serif";
    ctx.fillText(rank, 74, 82);
    ctx.font = "56px Georgia, serif";
    ctx.fillText(glyph, 74, 154);
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
