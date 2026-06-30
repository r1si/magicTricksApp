# Step 12 — ACAAN: mazzo "Foto", camera dall'alto, drag realistico, distribuzione

> Upgrade puramente **visivo/interazione** del gioco ACAAN dopo i test utente.
> La logica e il metodo segreto NON cambiano.

## Esito
Inizialmente erano state realizzate 3 varianti di rendering del mazzo per il
confronto; l'utente ha **scelto "Foto"**. Varianti extra e selettore **rimossi**.

## Cosa fa ora

### Mazzo (variante "Foto")
- Dorso a immagine reale `/public/cards/backCard.png`; facce procedurali
  (`scene/cardTextures.ts`); angoli arrotondati via `alphaMap` (`roundedAlphaTexture`).
- Mazzo più **compatto** (dimensioni carta ridotte in `scene/decks/cardModel.ts`,
  aspetto allineato all'immagine) → più spazio di manovra al drag.
- `scene/Deck.tsx` — pila instanziata (53 dorsi) + carta attiva + carte distribuite.

### Camera (`scene/CameraIntro.tsx`)
- Glissa da posa 3/4 iniziale (come prima) a posa **prevalentemente dall'alto**
  (~67°): abbastanza a picco da rendere lineare lo screen→tavolo (drag verso
  l'alto corretto), con un filo di prospettiva che mostra lo **spessore** del
  mazzo. `prefers-reduced-motion` → posa finale immediata.

### Drag + rivelazione + distribuzione
- `scene/ActiveCard.tsx` — proietta l'NDC del puntatore sul piano del tavolo
  (raycaster) e la carta vi scivola seguendo il dito; al rilascio resta dov'è;
  flip di π nella posizione corrente; glow + scintille seguono la carta.
- **Tap/double-tap a livello di gesture** (`AcaanGame.tsx`, use-gesture `tap`),
  non sulla mesh → il drag non viene mai scambiato per una rivelazione (fix
  "drag della prima carta").
- **Distribuzione**: 1° double-tap gira la carta; i successivi archiviano quella
  girata di lato (`DealtCardMesh`, a ventaglio) e ne distribuiscono/girano una
  nuova. Nuovo metodo store `holster()` + rimontaggio della carta attiva (key).

## Invariato (metodo segreto)
`state/store.ts` (solo aggiunta `holster`), `logic/*`, `hooks/*`,
`components/MethodClock.tsx`. Seme dal quadrante del primo swipe, valore dai
secondi al reveal.

## Criteri di accettazione
- `npm run typecheck` · `npm run lint` · `npm run build` · `npm run test` (18/18) ✅
- Verifica visiva headless (Chrome+SwiftShader): mazzo dall'alto con spessore
  visibile, dorso a immagine nitido.
- Da testare su device: drag prima carta, drag verso l'alto, ciclo di
  distribuzione col double-tap.

## Iterazione 2 (dopo test utente)
Feedback: «si trascina solo la prima carta; voglio sfilarne quante voglio e poi
girare quella che dico io» + «trascinando di qualche cm la carta compenetra
l'altra». Risolto così:

- **Distribuzione multipla** (`AcaanGame.tsx`, `ActiveCard.tsx`, `DealtCard.tsx`,
  `Deck.tsx`): la carta in cima si sfila e, rilasciata oltre l'impronta del mazzo,
  resta sul feltro (a dorso); una nuova carta sale subito in cima → se ne possono
  distribuire quante si vuole. La decisione di "carta sfilata" usa il punto del
  **dito** proiettato sul tavolo (non la carta, che insegue con ritardo elastico).
- **Flip della carta scelta**: il flip è stato spostato dalla carta attiva alle
  carte distribuite (`scene/DealtCard.tsx`, nuovo). Doppio tap su una carta a
  terra → flip di π in posizione, con glow oro e scintille; mostra la carta del
  metodo (`resolvedCard`). `store.reveal` ora fissa la carta **una sola volta**
  (le altre girate mostrano la stessa: l'illusione regge). Valore dai secondi al
  primo flip, seme dal primo swipe (metodo invariato).
- **Niente compenetrazione** (`ActiveCard.tsx`): la quota della carta sfilata è
  vincolata alla cima della pila finché si sovrappone all'impronta del mazzo
  (test a assi separatori, `deckClearance`); solo dopo averlo superato plana sul
  feltro. Mai sotto il livello della pila mentre la copre.
- **Camera** (`CameraIntro.tsx`): posa finale più arretrata/alta → il mazzo sta
  in alto-centro e davanti resta feltro libero per il ventaglio distribuito.
- Rimossi `store.holster` e il flag `CardControl.home`, ora inutilizzati.
- Verifica: typecheck · lint · build · test (18/18) ✅; verifica visiva headless
  (Chrome+SwiftShader) di sfilamento pulito, distribuzione multipla e flip.

## Iterazione 3 (dopo test utente)
Rifiniture su flip e carte:

- **Niente effetto brillante** al flip: rimossi glow oro e scintille dalla carta
  girata (`scene/DealtCard.tsx`).
- **Flip più fisico**: al doppio tap la carta si **solleva di qualche cm, gira e
  ricade** in posizione. Un solo valore 0→1 pilota giro (`rotation-x` → π) e arco
  di sollevamento (`sin` → su e giù). `prefers-reduced-motion` → flip immediato.
- **Spessore carte**: le carte **singole** (quella che sfili e quelle
  distribuite) usano `CARD_T_SINGLE` (più spesse del reale) così si legge il
  fianco del cartoncino mentre le sfili/giri; la **pila** resta sottile (mazzo
  realistico). `makeCardGeometry(thickness)` parametrizzato; due geometrie
  separate in `Deck.tsx`.
- **Carte diverse dalla prima**: la prima carta girata è quella del metodo
  (`resolvedCard`); **dalla seconda in poi** ogni carta mostra una carta
  **casuale e distinta** (52-card deck in `AcaanGame.tsx`, `pickRandomCard`
  esclude le già usate). Ogni `DealtCard` ha la propria faccia (`face`).
- Fix: `resolvedCard` va riletto con un nuovo `getState()` DOPO `reveal` (lo
  snapshot Zustand precedente non lo vede).
- Verifica: typecheck · lint · build · test (18/18) ✅; verifica visiva headless
  di flip con sollevamento, spessore del fianco e carte distinte.

## Iterazione 4 (dopo test utente)
Flip laterale + collisioni tra carte:

- **Flip laterale** (`scene/DealtCard.tsx`): la carta gira attorno al proprio
  **asse lungo** (`rotation-z`), come una pagina che si volta di lato, invece del
  ribaltamento testa-coda. La texture della faccia è ruotata di π (`center` +
  `rotation`) perché emerge capovolta.
- **Sollevamento sufficiente**: il flip è scandito come *si alza → gira in alto →
  ricade* (un valore 0→1 pilota `sin` per il salto e `smoothstep` sfasato per il
  giro). Il culmine del salto vale `CARD_W/2 + margine`, cioè più del semilato
  attorno a cui ruota → girando non tocca feltro né altre carte.
- **Collisioni tra carte** (`scene/decks/collision.ts`, con test): le carte sono
  rettangoli complanari, quindi **niente motore fisico**; basta sovrapposizione
  AABB + vettore di separazione minimo (MTV). Scelta documentata nel file.
- **Scivolamento della carta sopra**: se giri una carta coperta da una distribuita
  dopo, quella che la copre **scivola via** prima (MTV, restando sul feltro e
  lontana dal mazzo), poi parte il flip (`AcaanGame.tsx`, ritardo `SLIDE_MS`). La
  posizione delle carte distribuite è ora animata (spring) per lo scivolamento.
- Fix minori: `id` della carta calcolato fuori dall'updater di stato (StrictMode).
- Verifica: typecheck · lint · build · test (23/23, +5 di `collision`) ✅;
  verifica visiva headless di flip laterale con sollevamento, faccia dritta e
  scivolamento della carta soprastante.

## Aperto (follow-up)
- Aggiungere le 54 facce reali in `/public/cards/` per piena resa "foto".
- Eventuale resa delle righe delle singole carte sul bordo del mazzo.
- Cascata di collisioni a più carte (ora la carta spinta via potrebbe coprirne
  un'altra); disposizione del ventaglio e smorzamenti dopo il test su device.
