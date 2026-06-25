# Step 10 — ACAAN: rivelazione (flip, glow, scintille)

## Obiettivo
Mettere in scena il **momento magico**: la carta in cima si gira con
un'animazione fluida e, a metà flip, rivela **proprio** la carta calcolata dal
metodo segreto, accompagnata da glow oro e scintille dorate. È il climax: deve
essere appagante ma misurato.

## Prerequisiti
- Step 09 (double tap → `store.reveal`), Step 08 (carta attiva/texture),
  Step 05 (`resolvedCard`).

## Tooling obbligatorio
- **`context7`**: docs aggiornate di **`@react-spring/three`** (animazioni di
  rotazione/trasformazioni in r3f) — in alternativa GSAP. Verifica
  l'integrazione con `useFrame`/r3f.
- **skill `frontend-design`**: OBBLIGATORIA per timing, easing e dosaggio di
  glow/scintille (l'oro è accento, mai decorazione di fondo).

## Attività
1. **Installa** `@react-spring/three` (+ `@react-spring/web` se serve in UI).
2. **Flip carta** (designPattern §10, specs §6.5):
   - Rotazione **180°** attorno all'asse (Y o X), durata **520ms**,
     `cubic-bezier(.2,.7,.2,1)`.
   - **A metà animazione** (quando la carta è di taglio) **sostituisci la
     texture** della faccia con quella della `resolvedCard` calcolata dallo
     store → la scena chiede "quale carta mostrare" solo qui (specs §6.6).
   - Caricamento on-demand della faccia rivelata (coerente con Step 08).
3. **Glow oro**: applica `--glow-gold` / emissività dorata sulla carta durante e
   subito dopo il flip, poi svanisce.
4. **Scintille** (designPattern §8.5, §10):
   - Particelle dorate (`gold-300`/`gold-500`) che compaiono **solo** alla
     rivelazione, fade-in/out scaglionato ~600ms, poi spariscono.
   - **Mai** loop continuo di fondo.
5. **Reset / nuova giocata**: possibilità di rimettere la carta a dorso e
   ricominciare (nuovo `store.reset()` per una nuova sessione/seme).
6. **`prefers-reduced-motion`** (designPattern §10): se attivo, disattiva le
   scintille e riduci il flip a una **dissolvenza** semplice (niente rotazione
   vistosa).

## Riferimenti specifiche
- `specs.md` §3, §6.5, §6.6; `designPattern.md` §6, §8.5, §10.

## Criteri di accettazione
- Il doppio tap gira la carta e rivela esattamente la `resolvedCard` (verificato
  con casi noti, es. alto-sx + secondi 5 → 5 di Cuori).
- La texture viene scambiata a metà flip (nessuno "spoiler" prima del giro).
- Glow e scintille compaiono solo alla rivelazione e poi svaniscono.
- Con `prefers-reduced-motion` il flip diventa una dissolvenza senza scintille.
- Si può tornare al dorso e ripetere il trucco con un nuovo seme.
