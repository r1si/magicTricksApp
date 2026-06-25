# Step 09 — ACAAN: interazioni (swipe, quadrante, double tap)

## Obiettivo
Collegare i **gesti dell'utente** alla scena e al metodo segreto: swipe per
sfogliare, **cattura del quadrante al primissimo swipe** (= seme), e **doppio
tap** sulla carta per innescare la rivelazione.

## Prerequisiti
- Step 05 (store + logica), Step 08 (mazzo/carte).

## Tooling obbligatorio
- **`context7`**: docs aggiornate di **`@use-gesture/react`** (`useDrag`,
  threshold, velocity, integrazione con r3f) e degli **eventi puntatore** di
  `@react-three/fiber` (raycasting, `onPointerDown`).
- **skill `frontend-design`**: per la sensazione del gesto (inerzia, feedback).

## Attività
1. **Installa** `@use-gesture/react`.
2. **Swipe per sfogliare** (specs §6.5): `useDrag` sul canvas/mesh; direzione e
   velocità del drag fanno scorrere l'indice della carta in cima. Movimento con
   inerzia/spring (rifinito allo Step 10).
3. **Cattura quadrante al PRIMO swipe** (specs §6.5):
   - Leggi la coordinata **iniziale** del gesto in pixel schermo e confrontala
     con larghezza/altezza viewport → `suitFromQuadrant`.
   - Chiama `store.captureFirstSwipe(x, y, w, h)` **solo al primissimo swipe**
     della sessione (lo store ignora i successivi). Nessun feedback visibile:
     deve restare segreto.
4. **Double tap / rilevamento carta** (specs §6.5):
   - Usa gli eventi puntatore r3f con raycasting sulla carta in cima.
   - Rileva il **doppio tap** misurando l'intervallo tra due tap ravvicinati
     sulla **stessa mesh** (soglia ~300ms). Distinguilo dallo swipe.
   - Al double tap: leggi i **secondi correnti** dall'orologio (Step 06) e chiama
     `store.reveal(seconds)` → calcola `resolvedCard`. Poi innesca il flip
     (Step 10).
5. **Robustezza touch**: gestisci multi-touch, evita che lo scroll della pagina
   interferisca (`touch-action: none` sul canvas), e che il tap dell'orologio non
   conti.

## Riferimenti specifiche
- `specs.md` §3 (UX), §6.5, §6.6.

## Criteri di accettazione
- Lo swipe sfoglia il mazzo in modo fluido in entrambe le direzioni.
- Il **seme** viene fissato esattamente al primo swipe e non cambia più nella
  sessione (verificabile via store), senza alcun segnale visibile.
- Il doppio tap è riconosciuto in modo affidabile e non si confonde con lo swipe.
- Al double tap, `resolvedCard` corrisponde a quadrante-del-primo-swipe +
  secondi correnti (coerente con i test dello Step 05).
