# Trucchi di Magia — Specifica di Progetto

> PWA che raccoglie una collezione di trucchi di magia interattivi.
> Primo gioco disponibile al lancio: **ACAAN**.

---

## 1. Panoramica

**Trucchi di Magia** è una Progressive Web App che presenta all'utente una
**lista di giochi** di magia. Al lancio sarà disponibile **un solo gioco
(ACAAN)**, ma l'interfaccia deve comunicare chiaramente che la libreria
crescerà nel tempo.

### Indicazioni UI per l'estendibilità
- Card "Coming soon" sfumate / con lucchetto.
- Slot placeholder già visibili nella griglia.
- Eventuale etichetta tipo "1 gioco disponibile · altri in arrivo".

---

## 2. Architettura applicativa

- **Home / Lista giochi**: griglia di card, ciascuna con titolo, icona e stato
  (`available` / `coming-soon`).
- **Modularità**: ogni gioco è un modulo isolato con route propria, per poter
  aggiungere nuovi giochi senza toccare gli esistenti.

### Struttura cartelle proposta
```
app/
  layout.tsx
  page.tsx                 # Home: lista giochi
  games/
    [slug]/
      page.tsx             # Loader del gioco in base allo slug
  acaan/
    components/            # Componenti specifici del gioco
    scene/                 # Scena 3D (three.js / r3f)
    logic/                 # Metodo "segreto", mapping secondi → carta
config/
  games.config.ts          # Registro centrale dei giochi (alimenta la Home)
lib/
components/                 # Componenti UI condivisi
```

### Registro giochi (esempio concettuale)
```ts
// config/games.config.ts
export type Game = {
  slug: string;
  title: string;
  status: "available" | "coming-soon";
  icon: string;
};

export const GAMES: Game[] = [
  { slug: "acaan", title: "ACAAN", status: "available", icon: "/icons/acaan.svg" },
  // i prossimi giochi si aggiungono qui
];
```

---

## 3. Gioco 1 — ACAAN · Esperienza utente

ACAAN = *Any Card At Any Number*, uno dei plot più celebri della cartomagia.

- Apertura su **sfondo a tappetino verde da mago** (feltro/panno texturizzato).
- Al centro un **mazzo di carte 3D** con **dorso classico blu** (stile Bicycle).
- **Swipe** sul modello 3D → scorrimento delle carte.
- **Doppio tap** su una carta → la carta si gira e rivela, "miracolosamente",
  proprio quella pensata dallo spettatore.

---

## 4. Gioco 1 — ACAAN · Funzionamento (metodo segreto)

> Sezione riservata: è il meccanismo che fa funzionare il trucco.

### Orologio discreto in alto a sinistra
- Mostra **ora e minuti reali**.
- I **secondi** NON sono reali: partono da **1 all'apertura del gioco** e
  avanzano. Funziona quindi come un contatore controllabile dal mago.

### Selezione del SEME — i 4 quadranti
Lo schermo è diviso (idealmente) in 4 quadranti. A comandare è **il primo
swipe**: la posizione in cui avviene determina il seme.

| Quadrante | Posizione      | Seme        |
|-----------|----------------|-------------|
| 1         | Alto sinistra  | ♥ Cuori     |
| 2         | Alto destra    | ♦ Quadri    |
| 3         | Basso sinistra | ♣ Fiori     |
| 4         | Basso destra   | ♠ Picche    |

### Selezione del VALORE — i secondi
Il valore è dato dai **secondi** dell'orologio nel momento chiave.
Mappatura ciclica a blocchi di 20:

| Secondi   | Risultato            |
|-----------|----------------------|
| 1–13      | Asso … Re (A,2…10,J,Q,K) |
| 14–20     | Jolly                |
| 21–33     | Asso … Re (ciclo ripete) |
| 34–40     | Jolly                |
| 41–53     | Asso … Re            |
| 54–60     | Jolly                |
| 60        | scatta il minuto, ciclo riparte |

**Esempio**: primo swipe in alto a sinistra + secondi = 5 → qualunque carta
girata col doppio tap sarà il **5 di Cuori**.

In pratica il mago "carica" il valore aspettando il secondo giusto
(sottraendo mentalmente i multipli di 20) e sceglie il seme con la posizione
del primo swipe.

### Logica di mapping (riferimento)
```ts
// logic/resolveCard.ts
type Suit = "hearts" | "diamonds" | "clubs" | "spades";

function suitFromQuadrant(x: number, y: number, w: number, h: number): Suit {
  const left = x < w / 2;
  const top = y < h / 2;
  if (top && left) return "hearts";
  if (top && !left) return "diamonds";
  if (!top && left) return "clubs";
  return "spades";
}

// secondi → valore (1..13) oppure "joker"
function valueFromSeconds(sec: number): number | "joker" {
  const m = ((sec - 1) % 20) + 1; // normalizza nel blocco di 20
  return m <= 13 ? m : "joker";
}
```

---

## 5. Stile / UI

- **Sfondo**: feltro verde da mago, leggermente texturizzato, vignettatura
  morbida.
- **Mazzo**: dorso blu classico, facce carte tradizionali.
- **Tono**: elegante, misterioso, premium, un po' teatrale.

---

## 6. Realizzazione dei modelli 3D (Three.js / react-three-fiber)

### 6.1 Stack 3D scelto
Three.js da solo è imperativo e mal si sposa con il ciclo di render di React.
La scelta consigliata è il wrapper dichiarativo:

| Libreria | Ruolo |
|----------|-------|
| **three** | Motore 3D di base (WebGL). |
| **@react-three/fiber** (R3F) | Renderer React per Three.js: la scena è un albero di componenti. |
| **@react-three/drei** | Helper pronti (camera, loader texture, `useTexture`, `Html`, `Bounds`, environment). |
| **@use-gesture/react** | Gestione gesti touch (swipe, drag) integrata con R3F. |
| **@react-spring/three** *(o GSAP)* | Animazioni fluide (flip carta, scorrimento mazzo). |
| **@react-three/rapier** *(opzionale)* | Fisica, solo se in futuro si vuole un mazzo che "cade"/si sparpaglia. Non necessario per l'MVP. |

### 6.2 Modellazione del mazzo e delle carte
Non servono modelli scolpiti in Blender: una carta è geometricamente un
rettangolo sottile. Approccio consigliato:

- **Geometria carta**: `BoxGeometry` molto sottile (es. 0.64 × 0.89 × 0.006)
  oppure due `PlaneGeometry` (fronte/retro) con bordo. Il `Box` dà spessore
  realistico al mazzo impilato.
- **Mazzo**: 54 carte (52 + 2 jolly) posizionate lungo l'asse Y con un piccolo
  offset di spessore, così da formare una pila visibile.
- **Performance**: usare **`InstancedMesh`** per renderizzare tutte le carte
  con una sola draw call quando mostrate "impilate"/identiche di dorso. La
  carta "attiva" (che si gira) può essere una mesh separata con materiale
  proprio, estratta dall'istanza.

### 6.3 Texture e materiali
- **Texture atlas**: un'unica immagine (sprite sheet) contenente tutte le 54
  facce + il dorso blu, per ridurre il numero di texture caricate. Si mappano
  le UV della carta sulla porzione corretta dell'atlante.
- In alternativa per l'MVP: una texture per il dorso blu (condivisa) e
  caricamento on-demand della sola faccia che deve essere rivelata.
- **Materiale**: `MeshStandardMaterial` (reazione alla luce, look premium) con
  `map` per fronte e retro. Per il taglio fronte/retro su `BoxGeometry` si usa
  un array di materiali (uno per faccia del box).
- **Caricamento**: `useTexture` di drei, con `<Suspense>` e fallback di
  caricamento.

### 6.4 Illuminazione e atmosfera
- `ambientLight` soffusa + una `directionalLight`/`spotLight` per dare il
  riflesso "da palcoscenico" sul mazzo.
- `Environment` di drei (preset soft) per riflessi realistici sulle carte
  patinate.
- Tono cromatico caldo coerente con il verde del tappetino.

### 6.5 Interazione (swipe & double tap)
- **Swipe**: `@use-gesture/react` (`useDrag`) sul canvas o sulla mesh; la
  velocità/direzione del drag fa scorrere l'indice della carta in cima.
- **Quadrante del primo swipe**: si legge la coordinata iniziale del gesto
  (in pixel schermo) e la si confronta con larghezza/altezza viewport → seme.
  Questo va **catturato solo al primissimo swipe** della sessione di gioco.
- **Double tap / rilevamento carta**: R3F espone eventi puntatore con
  raycasting integrato (`onClick`, `onPointerDown`). Si gestisce il doppio tap
  misurando l'intervallo tra due tap ravvicinati sulla stessa mesh.
- **Flip**: animazione di rotazione sull'asse (es. rotazione di π attorno a Y o
  X) con react-spring/GSAP; a metà animazione si sostituisce la texture della
  faccia con quella della carta "risolta" dal metodo segreto.

### 6.6 Disaccoppiamento logica ↔ 3D
La scena 3D **non conosce** il metodo segreto. Esiste uno stato condiviso (es.
Zustand o context) che espone:
```ts
{
  firstSwipeSuit: Suit | null;      // settato al primo swipe
  resolvedCard: Card | null;        // calcolata da quadrante + secondi
  reveal(): void;                   // chiamata al double tap
}
```
La scena chiede "quale carta devo mostrare" solo al momento del flip, così la
parte visiva resta riusabile e testabile.

### 6.7 Integrazione con Next.js (App Router)
- Three.js richiede `window`: il componente Canvas va importato **client-side**.
  ```tsx
  "use client";
  import dynamic from "next/dynamic";
  const DeckScene = dynamic(() => import("./scene/DeckScene"), { ssr: false });
  ```
- Marcare la scena come `"use client"` e disabilitare l'SSR per il Canvas.
- Le texture vanno servite da `/public` o da CDN; precaricarle con `useTexture`.

### 6.8 Considerazioni di performance mobile
- `InstancedMesh` + texture atlas → poche draw call.
- Limitare il `dpr` (device pixel ratio) del Canvas (es. `dpr={[1, 2]}`).
- Mantenere il numero di luci basso e ombre disattivate (o molto soft).
- Lazy-loading della scena 3D solo quando si entra nel gioco.

---

## 7. Stack tecnico generale

- **Next.js** (ultima versione stabile, **App Router**)
- **React** + **TypeScript**
- **React Query** (gestione stato/dati asincroni)
- **Tailwind CSS**
- **react-three-fiber + drei + three** (livello 3D)
- **@use-gesture/react** + **@react-spring/three** (gesti e animazioni)
- **Docker Compose** (ambiente di sviluppo / deploy)
- Supporto **PWA**: manifest, service worker, installabilità, offline shell.

---

## 8. Nome multilingua (riferimento)

Traduzioni fedeli di "Trucchi di Magia":

- 🇬🇧 Magic Tricks
- 🇪🇸 Trucos de Magia
- 🇫🇷 Tours de Magie
- 🇩🇪 Zaubertricks
- 🇵🇹 Truques de Magia
- 🏛️ Ars Magica (latino)

Nomi brevi "brandabili": **Arcana**, **Prestige / Praestige**, **Sleight**,
**Illusio**, **Conjure**.
