# Step 06 — ACAAN: orologio del metodo (UI)

## Obiettivo
Realizzare l'**orologio discreto** in alto a sinistra: mostra `HH:MM:SS` dove
ore/minuti sono reali e i **secondi** sono il contatore controllato (Step 05).
Deve sembrare un orpello innocuo, non un protagonista.

## Prerequisiti
- Step 05 (logica orologio/contatore) e Step 01 (font mono).

## Tooling obbligatorio
- **skill `frontend-design`**: per dosare la discrezione (dimensione, opacità,
  posizione) — qui "eleganza è togliere".
- **`context7`**: solo se servono dettagli su hook/timer in React (cleanup di
  `setInterval`, `useSyncExternalStore`/Zustand).

## Attività
1. **`<MethodClock>`** in `app/acaan/components/`:
   - Font **IBM Plex Mono**, colore `--text-muted`, dimensione `0.875rem`
     (designPattern §8.3).
   - **Nessun riquadro, nessuna icona, nessuno sfondo**: testo nudo in alto a
     sinistra, dentro la safe-area.
   - Formato `HH:MM:SS` zero-padded; i secondi avanzano dal contatore dello Step
     05 (non da `new Date()`).
2. Avvio del contatore all'**ingresso nel gioco** (mount) con `reset` dello store;
   stop/cleanup all'unmount.
3. **A11y**: l'orologio è puramente visivo e segreto → escludilo dagli screen
   reader (`aria-hidden`) e non deve catturare focus.
4. Non deve interferire con i gesti del canvas sottostante (pointer-events
   gestiti, z-index corretto ma area minima).

## Riferimenti specifiche
- `specs.md` §4 (secondi = contatore), `designPattern.md` §8.3, §3.

## Criteri di accettazione
- L'orologio mostra ora/minuti reali e secondi che partono da 1 all'apertura.
- Stile mono, muted, senza cornice; visivamente "ininfluente".
- Aggiornamento fluido (1 Hz) senza leak di timer al cambio route.
- Invisibile agli screen reader; non blocca i gesti sul mazzo.
