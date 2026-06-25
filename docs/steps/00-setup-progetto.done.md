# Step 00 — Setup progetto & toolchain

## Obiettivo
Inizializzare il monorepo dell'applicazione **Trucchi di Magia**: progetto
Next.js (ultima versione stabile, **App Router**) con React + TypeScript,
Tailwind CSS, React Query e ambiente Docker Compose pronto per lo sviluppo.
Nessuna feature di gioco ancora: solo fondamenta solide e build verde.

## Prerequisiti
- Nessuno (è il primo step).

## Tooling obbligatorio
- **`context7`**: leggi la documentazione aggiornata di **Next.js (App Router)**,
  **Tailwind CSS** e **@tanstack/react-query** PRIMA di configurarli. Verifica
  l'attuale comando di scaffolding e la sintassi di config correnti.
- **skill `frontend-design`**: caricala per impostare correttamente le basi di
  layout/tema (sarà approfondito nello Step 01).

## Attività
1. Scaffolding di Next.js (App Router, TypeScript, ESLint) nella root del repo.
   - Abilita `strict: true` in `tsconfig.json`.
   - Configura alias di import `@/*`.
2. Installa e configura **Tailwind CSS** (con `globals.css` e direttive base).
3. Installa **@tanstack/react-query** e crea un `Providers` client-side
   (`app/providers.tsx`, `"use client"`) con `QueryClientProvider`; montalo in
   `app/layout.tsx`.
4. Crea la **struttura cartelle** prevista dalle specifiche (§2), anche con file
   placeholder dove serve:
   ```
   app/
     layout.tsx
     page.tsx
     providers.tsx
     games/[slug]/page.tsx
     acaan/{components,scene,logic}/
   config/games.config.ts
   lib/
   components/
   public/
   ```
5. Configura **ESLint + Prettier** coerenti e uno script `format`.
6. **Docker Compose** per lo sviluppo:
   - `Dockerfile` (multi-stage o dev) e `docker-compose.yml` con servizio `web`
     che espone la porta di Next, hot-reload via volume bind, `node_modules`
     gestiti correttamente.
   - File `.dockerignore` e `.env.example`.
7. Aggiorna `package.json` con script: `dev`, `build`, `start`, `lint`,
   `format`, `typecheck`.
8. `README.md` di root con istruzioni di avvio (locale e Docker).

## Riferimenti specifiche
- `specs.md` §2 (struttura cartelle) e §7 (stack tecnico).

## Criteri di accettazione
- `npm run dev` (o `docker compose up`) avvia l'app su una pagina segnaposto.
- `npm run build` e `npm run typecheck` passano senza errori.
- La struttura cartelle rispecchia le specifiche.
- Tailwind applica correttamente una classe di prova.
- React Query Provider è attivo (verificabile con un hook di test).
