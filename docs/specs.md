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
- I **secondi** sono un contatore che parte da **0 all'apertura del gioco** e
  cicla 0..59 — stesso intervallo di un orologio reale. È quindi un contatore
  controllabile dal mago.
- L'origine dei secondi è configurabile (vedi *Modalità di integrazione*):
  contatore interno dell'app **oppure** i secondi reali dell'orologio di sistema.

### Selezione del SEME — i 4 quadranti
Lo spazio è diviso (idealmente) in 4 quadranti. A comandare è **il primo
comando**: la posizione in cui avviene determina il seme.

| Quadrante | Posizione      | Seme        |
|-----------|----------------|-------------|
| 1         | Alto sinistra  | ♥ Cuori     |
| 2         | Alto destra    | ♦ Quadri    |
| 3         | Basso sinistra | ♣ Fiori     |
| 4         | Basso destra   | ♠ Picche    |

### Selezione del VALORE — i secondi
Il valore è dato dai **secondi** dell'orologio nel momento chiave.
Mappatura ciclica a blocchi di 20 (`valore = secondi mod 20`):

| Secondi      | Risultato            |
|--------------|----------------------|
| 00 · 20 · 40 | Carta bianca (lo zero del ciclo) |
| 1–13         | Asso … Re (A,2…10,J,Q,K) |
| 14–19        | Jolly                |
| 21–33        | Asso … Re (ciclo ripete) |
| 34–39        | Jolly                |
| 41–53        | Asso … Re            |
| 54–59        | Jolly                |

Il mazzo è composto da **55 carte**: 52 + 2 jolly + 1 bianca. Sfilando le carte
il pile cala visibilmente e, una volta esaurito (55 sfilate), sparisce. Le carte
distribuite che escono dallo schermo vengono rimosse (performance).

**Esempio**: primo comando in alto a sinistra + secondi = 5 → la carta
girata col doppio tap sarà il **5 di Cuori**.

In pratica il mago "carica" il valore aspettando il secondo giusto
(sottraendo mentalmente i multipli di 20) e sceglie il seme con la posizione
del primo comando.

### Modalità di integrazione (configurabili nel dossier)
Il mago sceglie nel segreto (`/segreti/acaan`) **come** dare i comandi; le
scelte persistono (localStorage) e il gioco le legge.

- **Quadrante di riferimento** (default `carta`): da dove si legge il quadrante
  del seme.
  - `carta`: posizione del tocco **sulla prima carta**; il comando vale a swipe
    completato o al doppio tap.
  - `schermo`: quadrante **dello schermo al primo tocco** (decisione presa alla
    pressione).
- **Tempo** (default `prima carta`): quando si leggono i secondi del valore.
  - `prima carta`: i secondi si bloccano **all'inizio dello swipe** (o al primo
    tocco in modalità schermo) e si confermano solo se il gesto si completa; uno
    swipe annullato (carta rimessa in cima) non fissa nulla.
  - `carta girata`: nell'istante in cui la carta viene girata.
- **Orologio** (default `app`): chi fornisce i secondi.
  - `app`: contatore interno (full screen best-effort all'avvio).
  - `telefono`: secondi reali del sistema (con promemoria di attivarli).

### Logica di mapping (riferimento)
```ts
// logic/resolveCard.ts
type Suit = "hearts" | "diamonds" | "clubs" | "spades";

// x,y,w,h: pixel dello schermo (modalità "schermo") oppure uv 0..1 della carta
// (modalità "carta") — la mappatura è la stessa.
function suitFromQuadrant(x: number, y: number, w: number, h: number): Suit {
  const left = x < w / 2;
  const top = y < h / 2;
  if (top && left) return "hearts";
  if (top && !left) return "diamonds";
  if (!top && left) return "clubs";
  return "spades";
}

// secondi (0..59) → valore: "blank" (zero del ciclo), 1..13, oppure "joker"
function valueFromSeconds(sec: number): number | "joker" | "blank" {
  const block = ((sec % 20) + 20) % 20; // 0..19
  if (block === 0) return "blank";
  return block <= 13 ? block : "joker";
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
- **Swipe**: drag sulla mesh della carta in cima; la carta segue il dito e, se
  rilasciata fuori dall'impronta del mazzo, viene distribuita sul feltro.
- **Quadrante del seme**: la scena riporta dati grezzi (uv del tocco sulla carta
  e, a livello di contenitore, le coordinate schermo); è il gioco a decidere
  **cosa** catturare e **quando**, in base alle impostazioni di integrazione
  (vedi §4). Il seme è **catturato una sola volta** per sessione.
- **Double tap / rilevamento carta**: R3F espone eventi puntatore con
  raycasting integrato. Si gestisce il doppio tap misurando l'intervallo tra due
  tap ravvicinati sulla stessa mesh — sia sulle carte distribuite sia sulla
  carta in cima al mazzo (girabile in posa).
- **Flip**: rotazione di π attorno all'asse lungo con react-spring (sollevamento
  + giro); la faccia mostrata è la carta "risolta" dal metodo segreto. La
  meccanica è condivisa tra carta in cima e carte distribuite (`scene/flip.ts`).

### 6.6 Disaccoppiamento logica ↔ 3D
La scena 3D **non conosce** il metodo segreto. Uno stato condiviso (Zustand)
espone solo l'esito, e il gioco orchestra **quando** fissare seme e secondi
secondo le impostazioni:
```ts
{
  suit: Suit | null;          // seme, fissato al comando del quadrante
  valueSeconds: number | null; // secondi del valore (modalità "su prima carta")
  resolvedCard: Card | null;   // calcolata al reveal da suit + secondi
  captureSuit(x, y, w, h): void; // px schermo oppure uv 0..1 della carta
  captureSeconds(sec): void;
  reveal(currentSeconds): void;  // usa valueSeconds se fissato, altrimenti i secondi correnti
}
```
Le **impostazioni di integrazione** vivono in uno store separato e persistente
(`state/settings.ts`). La scena chiede "quale carta devo mostrare" solo al
momento del flip, così la parte visiva resta riusabile e testabile.

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
