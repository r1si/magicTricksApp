# Step 03 — Registro giochi & Home (lista giochi)

## Obiettivo
Costruire il **registro centrale dei giochi** e la **Home**: una griglia di card
che comunica chiaramente che la libreria crescerà. Al lancio un solo gioco
disponibile (**ACAAN**), il resto in stato `coming-soon`.

## Prerequisiti
- Step 00, 01 (design system disponibile).

## Tooling obbligatorio
- **skill `frontend-design`**: OBBLIGATORIA per la composizione della griglia,
  la gerarchia visiva e il trattamento degli stati `available`/`coming-soon`.
- **`context7`**: docs Next.js App Router (Server/Client Components, `Link`,
  metadata) e Tailwind per la griglia responsive.

## Attività
1. **`config/games.config.ts`**: tipo `Game` e array `GAMES` (specs §2).
   ```ts
   export type GameStatus = "available" | "coming-soon";
   export type Game = {
     slug: string;
     title: string;
     subtitle?: string;
     status: GameStatus;
     icon: string;
   };
   export const GAMES: Game[] = [
     { slug: "acaan", title: "ACAAN", subtitle: "Any Card At Any Number",
       status: "available", icon: "/icons/acaan.svg" },
     // slot coming-soon di esempio per mostrare l'estendibilità
   ];
   ```
   Aggiungi 2–3 voci `coming-soon` placeholder (titoli misteriosi/sfumati).
2. **`<GameCard>`** (`components/`):
   - Contenitore `keyline` su feltro, `radius-lg`, icona, titolo in **Cinzel**
     maiuscolo, sottotitolo in body (designPattern §8.1).
   - Stato `available`: pieni colori; al tap `scale(0.98)` + accenno `glow-gold`.
   - Stato `coming-soon`: opacità ~0.5, **lucchetto** avorio, nessun glow, non
     cliccabile.
3. **Home (`app/page.tsx`)**:
   - Titolo app in Cinzel ("TRUCCHI DI MAGIA").
   - Griglia responsive (gap 16px) che mappa `GAMES`.
   - Etichetta dinamica tipo **"1 gioco disponibile · altri in arrivo"**
     calcolata dal registro.
   - Slot placeholder visibili per rinforzare l'idea di collezione (specs §1).
   - Le card `available` linkano a `/games/[slug]`.
4. Animazione apertura card: fade + slide-up 8px, 240ms ease-out
   (designPattern §10), rispettando `prefers-reduced-motion`.
5. `metadata` della Home (title/description) per SEO/PWA.

## Riferimenti specifiche
- `specs.md` §1–§2; `designPattern.md` §8.1, §10.

## Criteri di accettazione
- La Home mostra ACAAN come unico gioco `available` e gli slot `coming-soon`.
- Il contatore "N giochi disponibili · altri in arrivo" è derivato dal registro
  (non hard-coded).
- Le card rispettano il pattern keyline e gli stati visivi descritti.
- Aggiungere un gioco al registro lo fa comparire in Home senza altre modifiche.
- Layout corretto su mobile (1–2 colonne) e desktop.
