# Step 07 — ACAAN: scena 3D base (Canvas, luci, atmosfera)

## Obiettivo
Allestire il **palco 3D**: Canvas react-three-fiber montato client-side
(no SSR), illuminazione "da palcoscenico", environment per riflessi premium e
tavolo feltro coerente col tema. Ancora senza mazzo: solo scena, luci e camera.

## Prerequisiti
- Step 04 (route gioco) e Step 01 (token colore).

## Tooling obbligatorio
- **`context7`**: docs aggiornate di **`three`**, **`@react-three/fiber`** e
  **`@react-three/drei`** (in particolare `<Canvas>`, `dpr`, `Environment`,
  luci, `<Suspense>`). Verifica le versioni compatibili tra loro e con React.
- **skill `frontend-design`**: per l'atmosfera (temperatura luce, vignettatura,
  coerenza col feltro).

## Attività
1. **Installa** `three`, `@react-three/fiber`, `@react-three/drei`.
2. **`scene/DeckScene.tsx`** (`"use client"`) + import dinamico con `ssr: false`
   (specs §6.7):
   ```tsx
   const DeckScene = dynamic(() => import("./scene/DeckScene"), { ssr: false });
   ```
   Montalo dentro `AcaanGame`.
3. **`<Canvas>`**:
   - `dpr={[1, 2]}` per limitare il pixel ratio su mobile (specs §6.8).
   - Camera in posizione adatta a inquadrare un mazzo centrato.
   - Colore/sfondo trasparente per lasciare passare il gradiente feltro CSS
     (oppure piano feltro 3D — scegli e motiva).
4. **Illuminazione** (specs §6.4):
   - `ambientLight` soffusa + una `directionalLight`/`spotLight` per il riflesso
     da palco. Tono cromatico **caldo**, coerente col verde.
   - Ombre **disattivate o molto soft** (performance mobile, §6.8).
5. **`Environment`** di drei (preset soft) per riflessi realistici sulle carte
   patinate.
6. **Piano/tavolo**: ombra a terra coerente con `--shadow-float`
   (designPattern §8.4), eventuale leggera vignettatura.
7. **`<Suspense>`** con fallback di caricamento elegante (Step 04) mentre la
   scena/asset si inizializzano.
8. **Lazy load**: la scena 3D si carica solo entrando nel gioco (§6.8).

## Riferimenti specifiche
- `specs.md` §6.1, §6.4, §6.7, §6.8; `designPattern.md` §8.4.

## Criteri di accettazione
- Entrando in `/games/acaan` si vede il tavolo feltro con illuminazione calda,
  senza errori SSR (`window is not defined`).
- Il `dpr` è limitato; nessun lag evidente su mobile.
- La scena è in un chunk caricato solo all'ingresso nel gioco.
- Pronta ad accogliere il mazzo (Step 08).
