# Step 04 — Routing modulare dei giochi

## Obiettivo
Implementare il **loader dei giochi** basato sullo slug, in modo che ogni gioco
sia un modulo isolato caricato on-demand. Aggiungere un gioco non deve toccare
quelli esistenti né il routing.

## Prerequisiti
- Step 03 (registro giochi e Home).

## Tooling obbligatorio
- **`context7`**: docs Next.js App Router su **route dinamiche** (`[slug]`),
  **`generateStaticParams`**, `notFound()`, e **`next/dynamic`** per il lazy
  loading lato client.

## Attività
1. **`app/games/[slug]/page.tsx`**:
   - Valida lo `slug` contro `GAMES`; se assente o `coming-soon` → `notFound()`.
   - `generateStaticParams` dai giochi `available`.
   - `metadata` dinamici (title del gioco).
2. **Registry di moduli**: una mappa slug → loader del componente gioco, es.
   ```ts
   const GAME_LOADERS: Record<string, () => Promise<{ default: ComponentType }>> = {
     acaan: () => import("@/app/acaan/AcaanGame"),
   };
   ```
   Il loader monta dinamicamente il gioco corrispondente; gli altri giochi non
   vengono importati.
3. **Lazy loading client-side** del gioco con stato di **loading** elegante
   (feltro + spinner/scintilla discreta) e gestione errori (error boundary di
   route, `error.tsx`).
4. **Layout di gioco** (`app/games/[slug]/layout.tsx` opzionale): contenitore a
   tutto schermo feltro, eventuale pulsante "indietro" alla Home (avorio,
   discreto), safe-area per notch.
5. **Stub `AcaanGame`** in `app/acaan/AcaanGame.tsx` (`"use client"`) come
   placeholder: verrà riempito dagli step 05–10.

## Riferimenti specifiche
- `specs.md` §2 (modularità) e §6.7 (integrazione Next.js / `ssr: false`).

## Criteri di accettazione
- `/games/acaan` carica lo stub ACAAN; uno slug inesistente → 404 corretto.
- Uno slug `coming-soon` non è raggiungibile (404/redirect).
- Il bundle del gioco è in chunk separato (verificabile in build/Network).
- Aggiungere una entry in `GAME_LOADERS` + registro basta per abilitare un nuovo
  gioco.
