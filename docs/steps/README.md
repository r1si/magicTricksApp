# Trucchi di Magia — Piano di lavoro (Steps)

> Sequenza di step implementativi per costruire la PWA **Trucchi di Magia** e
> il primo gioco **ACAAN**. Ogni file è un **prompt autonomo** da dare a un
> agente di sviluppo: descrive obiettivo, attività, riferimenti alle specifiche
> e criteri di accettazione.

## Documenti di riferimento
- Specifica funzionale: [`../specs.md`](../specs.md)
- Design system: [`../designPattern.md`](../designPattern.md)
- Logo temporaneo: [`../tmp_logo.png`](../tmp_logo.png)

## Regole valide per TUTTI gli step
1. **Usa sempre la skill `frontend-design`** prima di scrivere o modificare UI:
   serve a non produrre design "templated" e a rispettare il linguaggio visivo
   (feltro verde, cornice avorio, oro come accento, motion misurato).
2. **Usa `context7`** per leggere la documentazione aggiornata di OGNI libreria
   prima di usarla (Next.js, Tailwind, react-three-fiber, drei, Zustand,
   @use-gesture/react, @react-spring/three, next-pwa/Serwist, React Query…).
   Non fidarti della memoria: le API cambiano.
3. Rispetta la **struttura cartelle** e il **disaccoppiamento logica ↔ 3D**
   indicati nelle specifiche (§2 e §6.6).
4. TypeScript strict, niente `any` non giustificati. Mobile-first.
5. A fine step verifica i **criteri di accettazione** prima di considerarlo chiuso.

## Sequenza

> **Convenzione:** uno step completato e verificato ha il file rinominato con il
> suffisso `.done` (es. `00-setup-progetto.done.md`).

| Step | File | Obiettivo |
|------|------|-----------|
| 00 ✅ | `00-setup-progetto.done.md` | Scaffolding Next.js + TS + Tailwind + React Query + Docker |
| 01 ✅ | `01-design-system.done.md` | Token, font, sfondo feltro, cornice avorio, utility |
| 02 ✅ | `02-pwa.done.md` | Manifest, service worker, icone, offline shell, installabilità |
| 03 ✅ | `03-registro-giochi-home.done.md` | `games.config.ts` + Home con griglia card |
| 04 ✅ | `04-routing-modulare.done.md` | Route `games/[slug]` e caricamento modulare dei giochi |
| 05 ✅ | `05-acaan-logica-stato.done.md` | Stato condiviso + metodo segreto (logica pura, testata) |
| 06 ✅ | `06-acaan-orologio.done.md` | Orologio del metodo (contatore secondi) |
| 07 ✅ | `07-acaan-scena-3d.done.md` | Canvas r3f, luci, environment, tavolo |
| 08 ✅ | `08-acaan-mazzo-carte.done.md` | Geometria carte, InstancedMesh, texture/materiali |
| 09 ✅ | `09-acaan-interazioni.done.md` | Swipe + quadrante primo swipe + double tap |
| 10 ✅ | `10-acaan-rivelazione.done.md` | Flip carta, glow, scintille dorate |
| 11 ✅ | `11-accessibilita-performance.done.md` | A11y, performance mobile, audit PWA, rifinitura |
| 12 ✅ | `12-acaan-mazzo-camera-drag.done.md` | Mazzo dettagliato (3 varianti), camera dall'alto, drag realistico |
| 13 ✅ | `13-acaan-modalita-scatolina.done.md` | Modalità di partenza mazzo/scatolina, swipe d'estrazione, valore semplificato |

Eseguire **in ordine**: ogni step assume completati i precedenti.
