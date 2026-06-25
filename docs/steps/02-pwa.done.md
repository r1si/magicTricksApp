# Step 02 — PWA (manifest, service worker, installabilità, offline)

## Obiettivo
Rendere l'app una **Progressive Web App** installabile, con manifest, icone
derivate dal logo, service worker e una **offline shell** funzionante. Tema di
sistema coerente con il feltro.

## Prerequisiti
- Step 00 e 01 completati.

## Tooling obbligatorio
- **`context7`**: leggi le docs aggiornate della soluzione PWA per Next.js
  App Router (valuta **Serwist** / `@serwist/next` o `next-pwa`) e di
  **Workbox** per le strategie di cache. Verifica compatibilità con la versione
  di Next installata.
- **skill `frontend-design`**: per icone/splash e per la coerenza del
  `theme-color` con il sistema.

## Attività
1. **`manifest.webmanifest`** (in `app/` o `public/`):
   - `name`: "Trucchi di Magia", `short_name`: "Magia".
   - `background_color`: `#15603E` (felt-700), `theme_color`: `#0E4D34`
     (felt-900), `display`: `standalone`, `orientation`: `portrait`.
   - `start_url`, `scope`, `lang: "it"`, `categories`.
2. **Icone** generate dal logo (`docs/tmp_logo.png`, squircle, sfondo verde):
   - Set PNG `192`, `256`, `384`, `512`, icona **maskable** 512, `apple-touch-icon`,
     favicon. Salvale in `public/icons/`.
   - Documenta come rigenerarle (script o tool) per quando arriverà il logo
     definitivo.
3. **Service worker**:
   - Precache della **app shell** (HTML di base, CSS, font, JS critico).
   - Strategia runtime: `CacheFirst` per font/asset statici e texture; gli asset
     3D pesanti (texture atlas) vanno cache-ati dopo il primo uso.
   - Registrazione SW client-side.
4. **Offline shell**: una pagina/fallback offline elegante (feltro + messaggio in
   Cinzel) mostrata quando manca la rete.
5. **Meta tag** in `layout.tsx`: `themeColor`, `viewport` (incl.
   `viewport-fit=cover` per i notch), link manifest e apple-touch-icon.
6. Verifica **installabilità** (prompt A2HS) su mobile/desktop.

## Riferimenti specifiche
- `specs.md` §7 (PWA), `designPattern.md` §11.

## Criteri di accettazione
- Lighthouse → categoria **PWA installabile** soddisfatta (manifest valido, SW
  registrato, icone corrette).
- L'app si installa e si apre in standalone con splash/tema verdi.
- Da offline, ricaricando, compare la offline shell (non l'errore del browser).
- Nessun warning del manifest nei DevTools.
