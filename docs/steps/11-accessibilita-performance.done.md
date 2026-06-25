# Step 11 — Accessibilità, performance mobile & rifinitura

## Obiettivo
Portare l'app a livello "premium e installabile": accessibilità, performance su
mobile, audit PWA e rifinitura visiva finale coerente col design system.

## Prerequisiti
- Step 00–10 completati (app + ACAAN funzionante end-to-end).

## Tooling obbligatorio
- **`context7`**: docs aggiornate su **Lighthouse/Web Vitals**, ottimizzazioni
  **react-three-fiber** (performance, `<PerformanceMonitor>` di drei) e Next.js
  (analisi bundle, `next/image`).
- **skill `frontend-design`**: per il pass finale di coerenza estetica e motion.

## Attività
1. **Accessibilità**:
   - `prefers-reduced-motion` rispettato ovunque (Home, flip, scintille).
   - Contrasto testo su feltro conforme; focus ring oro visibile e coerente.
   - Touch target ≥ **44×44px** (designPattern §4); navigazione da tastiera per
     la UI 2D (Home, bottoni); `aria-label` dove servono.
   - L'orologio resta `aria-hidden` (Step 06).
2. **Performance mobile** (specs §6.8):
   - `dpr={[1, 2]}`, luci minime, ombre off/soft.
   - `InstancedMesh` + (idealmente) texture atlas → poche draw call.
   - Lazy-loading della scena 3D solo all'ingresso nel gioco.
   - Misura FPS su un dispositivo mid-range reale; valuta
     `<PerformanceMonitor>`/adaptive dpr di drei.
3. **PWA / caching**:
   - Verifica precache app shell + caching delle texture pesanti (Step 02).
   - Offline shell funzionante anche dopo l'uso del gioco.
4. **Audit**:
   - Lighthouse: **PWA installabile**, Performance, Accessibility, Best
     Practices su mobile. Annota e correggi i regressi principali.
   - Bundle analysis: il gioco resta in chunk separato; nessuna libreria 3D nel
     bundle della Home.
5. **Rifinitura visiva** (pass `frontend-design`):
   - Coerenza di raggi/ombre/keyline su tutte le superfici.
   - Microcopy in italiano, etichetta "N giochi disponibili · altri in arrivo".
   - Stato `coming-soon` curato; transizioni di pagina morbide.
6. **Documentazione**: aggiorna il `README` di root con build/deploy (Docker),
   note PWA, e come aggiungere un nuovo gioco (registro + loader + modulo).

## Riferimenti specifiche
- `specs.md` §6.8, §7; `designPattern.md` §4, §6, §10, §13 ("cosa evitare").

## Criteri di accettazione
- Lighthouse mobile: PWA installabile ✔; Performance e Accessibility in fascia
  alta (annota i punteggi raggiunti).
- Nessuna animazione continua di fondo; `prefers-reduced-motion` pienamente
  rispettato.
- Il gioco gira fluido su mobile mid-range senza cali vistosi di FPS.
- L'app installata funziona offline (shell) e mostra il tema verde corretto.
- La checklist "cosa evitare" (designPattern §13) è rispettata.
