# Step 08 — ACAAN: mazzo & carte (geometria, InstancedMesh, texture)

## Obiettivo
Modellare il **mazzo di carte 3D** con dorso blu classico, impilato e
performante, pronto per essere sfogliato e per rivelare la carta "attiva".

## Prerequisiti
- Step 07 (scena, luci, environment).

## Tooling obbligatorio
- **`context7`**: docs aggiornate di **`three`** (`BoxGeometry`,
  `InstancedMesh`, materiali per-faccia, UV) e **`@react-three/drei`**
  (`useTexture`, `Instances`/`Instance` se preferibile a `InstancedMesh`).
- **skill `frontend-design`**: per fedeltà del look "Bicycle" (dorso blu,
  bordi avorio, finitura patinata premium).

## Attività
1. **Geometria carta** (specs §6.2): `BoxGeometry` sottile (~`0.64 × 0.89 ×
   0.006`) per dare spessore realistico alla pila. Angoli arrotondati otticamente
   se possibile (o via texture con bordo).
2. **Mazzo**: **54 carte** (52 + 2 jolly) impilate lungo l'asse Y con piccolo
   offset di spessore → pila visibile.
3. **Performance** (specs §6.2): usa **`InstancedMesh`** (o `Instances` di drei)
   per renderizzare tutte le carte di dorso con **una sola draw call**. La carta
   **attiva** (quella che si gira) è una **mesh separata** con materiale proprio,
   "estratta" dall'istanza in cima.
4. **Texture & materiali** (specs §6.3):
   - **MVP**: una texture per il **dorso blu** condivisa (royal-500) + bordo
     avorio; caricamento **on-demand** della sola faccia da rivelare.
   - Predisponi (anche solo come TODO documentato) il passaggio a un **texture
     atlas** (sprite sheet 54 facce + dorso) con mapping UV, per ridurre le
     texture caricate.
   - **`MeshStandardMaterial`** (look premium, reazione alla luce) con `map`
     per fronte/retro; per il `BoxGeometry` usa **array di materiali** (uno per
     faccia del box) così fronte e retro sono distinti.
   - Caricamento via **`useTexture`** di drei dentro **`<Suspense>`** con
     fallback.
5. **Asset**: prepara/posiziona in `public/` la texture del dorso blu e (per
   l'MVP) qualche faccia di test, più il segnaposto per l'atlante.
6. **Stato visivo**: indice della carta in cima sfogliabile (sarà guidato dallo
   swipe nello Step 09); per ora esponi una prop/segnale per cambiare la carta in
   cima.

## Riferimenti specifiche
- `specs.md` §6.2, §6.3; `designPattern.md` §2 (royal/ivory), §9.

## Criteri di accettazione
- Il mazzo appare come pila coesa con dorso blu e bordo avorio, ombra morbida.
- Le carte impilate usano una sola/poche draw call (verifica con r3f perf/stats).
- La carta in cima è una mesh distinta, pronta per flip e texture dinamica.
- Le texture si caricano con Suspense senza "lampi" o errori.
