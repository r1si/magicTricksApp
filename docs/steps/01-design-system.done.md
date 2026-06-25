# Step 01 — Design System & tema

## Obiettivo
Trasformare il design system (`designPattern.md`) in token e primitive
riutilizzabili: palette, font, sfondo "tappetino feltro", raggi, ombre e
l'**elemento firma** (cornice avorio / keyline). Tutto il resto dell'app dovrà
attingere SOLO da questi token.

## Prerequisiti
- Step 00 completato.

## Tooling obbligatorio
- **skill `frontend-design`**: OBBLIGATORIA. Caricala e seguila per calibrare
  scelte tipografiche, gerarchia, motion e per evitare un look generico.
- **`context7`**: leggi le docs aggiornate di **Tailwind CSS** (config
  `theme.extend`, layer) e di **`next/font`** (Google fonts self-hosted).

## Attività
1. **Palette** in `tailwind.config.ts` → `theme.extend.colors` con i token:
   `felt {500,700,900}`, `royal {500,700}`, `ivory {50,100}`, `wine {500,600}`,
   `gold {300,500}` (vedi designPattern §12).
2. **Variabili semantiche** in `globals.css` (`:root`): `--bg`, `--surface`,
   `--text`, `--text-muted`, `--accent`, `--danger`, i `--radius-*`, le
   `--shadow-*` e `--glow-gold` (designPattern §12).
3. **Sfondo feltro**: utility/classe che applica il gradiente radiale del
   tappetino (designPattern §2) come sfondo full-screen di base nel `layout`.
4. **Font** via `next/font` (self-hosted, no flash):
   - Display: **Cinzel** (solo maiuscolo, `letter-spacing: 0.08em`).
   - Body: **Hanken Grotesk** (line-height 1.55).
   - Utility/dati: **IBM Plex Mono** (orologio).
   - Esponili come CSS variables (`--font-display`, `--font-body`, `--font-mono`)
     e mappali in Tailwind (`fontFamily`).
5. **Scala tipografica** (designPattern §3) come classi/utility riusabili.
6. **Raggi e ombre**: mappa i `--radius-*` e `--shadow-*` in Tailwind
   (`borderRadius`, `boxShadow`), incluso `radius-card` per le carte da gioco.
7. **Componente `<Keyline>`** (o utility `.keyline`): cornice avorio sottile
   (`1.5px ivory-50 @ 24%`) + `radius-lg` + `surface` + `shadow-card`
   (designPattern §7). È la base di ogni superficie "che è una carta".
8. **Primitive UI condivise** in `components/`:
   - `<ButtonPrimary>` (avorio su testo felt-900, glow oro discreto al press).
   - `<ButtonSecondary>` (trasparente + keyline avorio).
   - Set icone semi ♥ ♦ ♣ ♠ + lucchetto come componenti SVG (designPattern §9).
9. **Pagina/route di anteprima** (`/dev/styleguide`, solo in sviluppo) che mostra
   palette, tipografia, bottoni, keyline: utile come riferimento visivo.

## Riferimenti specifiche
- `designPattern.md` §1–§3, §5–§7, §9, §12.

## Criteri di accettazione
- Lo sfondo feltro con gradiente radiale è visibile su tutte le schermate.
- I font Cinzel/Hanken Grotesk/IBM Plex Mono sono caricati e applicati ai ruoli
  corretti, senza FOUT evidente.
- `.keyline` rende una superficie che "sembra una carta sul tavolo".
- Nessun valore colore/raggio/ombra hard-coded nei componenti: solo token.
- La styleguide di sviluppo rende correttamente tutte le primitive.
