# Trucchi di Magia

PWA che raccoglie una collezione di trucchi di magia interattivi.
Primo gioco al lancio: **ACAAN** (_Any Card At Any Number_).

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** (config CSS-first via `@theme`)
- **@tanstack/react-query** (stato/dati asincroni)
- **Prettier** + **ESLint** (`eslint-config-next` + `eslint-config-prettier`)
- **Docker Compose** per sviluppo e build di produzione
- Supporto **PWA** (in arrivo: Step 02)

Il livello 3D (react-three-fiber / drei) e la PWA vengono aggiunti negli step
successivi — vedi [`docs/steps`](docs/steps/README.md).

## Sviluppo locale

```bash
npm install
npm run dev          # http://localhost:3000
```

Script disponibili:

| Script | Descrizione |
|--------|-------------|
| `npm run dev` | Server di sviluppo |
| `npm run build` | Build di produzione |
| `npm start` | Avvia la build di produzione |
| `npm run lint` | ESLint |
| `npm run typecheck` | Type-check TypeScript (`tsc --noEmit`) |
| `npm run format` | Formatta con Prettier |
| `npm run format:check` | Verifica formattazione |

## Sviluppo con Docker

```bash
docker compose up --build    # http://localhost:3000, con hot reload
```

Il servizio `web` usa lo stage `dev` del `Dockerfile`, monta il codice in bind
e mantiene `node_modules`/`.next` in volumi dedicati.

## Build immagine di produzione

```bash
docker build --target runner -t trucchi-di-magia .
docker run -p 3000:3000 trucchi-di-magia
```

L'immagine sfrutta l'output `standalone` di Next.js.

## Struttura del progetto

```
app/
  layout.tsx              # Root layout + Providers
  page.tsx                # Home (lista giochi — Step 03)
  providers.tsx           # React Query provider (client)
  games/[slug]/page.tsx   # Loader del gioco per slug (Step 04)
  acaan/
    components/           # Componenti UI del gioco
    scene/                # Scena 3D (three.js / r3f)
    logic/                # Metodo segreto, mapping
config/
  games.config.ts         # Registro centrale dei giochi
lib/                      # Utility condivise
components/               # Componenti UI condivisi
docs/                     # Specifiche, design system, step di lavoro
```

## Aggiungere un nuovo gioco

Ogni gioco è un modulo isolato; aggiungerne uno non tocca gli altri:

1. Crea il modulo in `app/<gioco>/<Gioco>Game.tsx` (`"use client"`, default export).
2. Registra il gioco in [`config/games.config.ts`](config/games.config.ts)
   (`slug`, `title`, `status`, ecc.).
3. Mappa lo slug al modulo in [`components/GameLoader.tsx`](components/GameLoader.tsx):
   ```ts
   const GAME_LOADERS = {
     acaan: dynamic(() => import("@/app/acaan/AcaanGame"), { ssr: false }),
     "<gioco>": dynamic(() => import("@/app/<gioco>/<Gioco>Game"), { ssr: false }),
   };
   ```

La Home, il routing `games/[slug]` e il code-splitting si aggiornano da soli.

## Accessibilità & performance

- **Motion**: `prefers-reduced-motion` rispettato ovunque (animazioni ridotte;
  il flip diventa istantaneo e le scintille sono disattivate).
- **Focus**: focus-ring oro visibile; touch target ≥ 44px; UI 2D navigabile da
  tastiera. L'orologio del metodo è `aria-hidden`.
- **3D mobile**: `dpr` limitato a `[1, 2]`, ombre via `ContactShadows`,
  `InstancedMesh` per il mazzo, texture procedurali (nessun asset di rete),
  scena 3D caricata solo all'ingresso nel gioco (`ssr:false`).
- **Offline**: il service worker serve le pagine già visitate anche offline e,
  in mancanza, una offline shell.

> Nota: i punteggi di performance vanno misurati su dispositivo reale — in
> headless con WebGL software (SwiftShader) non sono indicativi.

## Documentazione

- Specifica: [`docs/specs.md`](docs/specs.md)
- Design system: [`docs/designPattern.md`](docs/designPattern.md)
- Piano di lavoro per step: [`docs/steps`](docs/steps/README.md)
