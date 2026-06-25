# Step 05 — ACAAN: stato condiviso & metodo segreto

## Obiettivo
Implementare il **cuore logico** del trucco — completamente **disaccoppiato dalla
scena 3D** — e lo **stato condiviso** che la scena consulterà solo al momento
giusto. Questa logica è pura, deterministica e **testata**.

> ⚠️ Sezione riservata: è il meccanismo segreto. Tienilo isolato, ben commentato
> e coperto da test, perché un bug qui "rompe la magia".

## Prerequisiti
- Step 04 (stub `AcaanGame`).

## Tooling obbligatorio
- **`context7`**: docs aggiornate di **Zustand** (creazione store, selettori,
  uso in React) e di un runner di test (es. **Vitest**) se non già presente.

## Attività
1. **Tipi & logica** in `app/acaan/logic/`:
   - `types.ts`: `Suit = "hearts" | "diamonds" | "clubs" | "spades"`,
     `CardValue = 1..13 | "joker"`, `Card = { suit; value }`.
   - `resolveCard.ts`:
     - `suitFromQuadrant(x, y, w, h): Suit` — alto-sx ♥, alto-dx ♦, basso-sx ♣,
       basso-dx ♠ (specs §4).
     - `valueFromSeconds(sec): number | "joker"` — `m = ((sec - 1) % 20) + 1`,
       ritorna `m` se `<= 13`, altrimenti `"joker"` (specs §4, blocchi di 20).
     - `resolveCard(quadrant, seconds): Card`.
   - Commenta la mappatura ciclica con la tabella delle specifiche.
2. **Orologio/contatore** in `logic/clock.ts`:
   - Ora e minuti **reali**; i **secondi** sono un contatore che parte da **1**
     all'apertura del gioco e avanza (1→60, poi scatta il minuto e riparte).
   - Esponi un hook/utility che fornisce `{ hh, mm, ss }` e un valore `ss`
     leggibile dalla logica al momento chiave. Mantieni la sorgente del tempo
     iniettabile (per testabilità: niente `Date.now()` sparso).
3. **Store condiviso** (Zustand) in `app/acaan/state/store.ts` (interfaccia da
   specs §6.6):
   ```ts
   {
     firstSwipeSuit: Suit | null;   // settato SOLO al primissimo swipe
     resolvedCard: Card | null;     // calcolata da quadrante + secondi
     captureFirstSwipe(x, y, w, h): void;
     reveal(seconds: number): void; // calcola e fissa resolvedCard
     reset(): void;                 // re-init all'ingresso nel gioco
   }
   ```
   - `captureFirstSwipe` imposta il seme **una sola volta** per sessione.
   - `reveal` usa il seme catturato + i secondi correnti per calcolare la carta.
4. **Test unitari** (`*.test.ts`):
   - Tabella verità dei 4 quadranti.
   - `valueFromSeconds` su tutti i confini: 1, 13, 14, 20, 21, 33, 34, 53, 54, 60.
   - Esempio specs: alto-sx + secondi 5 → **5 di Cuori**.
   - `captureFirstSwipe` ignora i swipe successivi al primo.

## Riferimenti specifiche
- `specs.md` §4 (metodo segreto, tabelle) e §6.6 (disaccoppiamento).

## Criteri di accettazione
- Tutti i test passano, inclusi i casi-limite dei blocchi di 20 e i jolly.
- La logica non importa nulla di three.js/r3f (zero accoppiamento col 3D).
- Lo store espone esattamente l'interfaccia concordata; il seme si fissa solo al
  primo swipe.
