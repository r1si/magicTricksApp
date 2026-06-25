# CLAUDE.md — Trucchi di Magia

Guida operativa per agenti che lavorano su questo repository.

## Cos'è
PWA (Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, React
Query) che raccoglie trucchi di magia interattivi. Primo gioco: **ACAAN**
(scena 3D con react-three-fiber). Look "teatro tascabile": feltro verde, cornice
avorio, oro come accento.

## Documenti di riferimento
- Specifica funzionale: `docs/specs.md`
- Design system: `docs/designPattern.md`
- Piano di lavoro per step: `docs/steps/README.md`

## Flusso di lavoro per step
Il lavoro è organizzato in step sequenziali in `docs/steps/` (`00-…`, `01-…`).
Eseguirli in ordine: ogni step assume completati i precedenti.

Per OGNI step:
1. **Usa la skill `frontend-design`** prima di scrivere/modificare UI.
2. **Usa `context7`** per leggere la documentazione aggiornata di ogni libreria
   prima di usarla (non fidarti della memoria: le API cambiano).
3. Verifica i **criteri di accettazione** dello step (typecheck, lint, build e,
   dove ha senso, uno smoke test) prima di considerarlo chiuso.

### ⚑ DIRETTIVA: marcare gli step completati
**Dopo aver completato e verificato uno step**, rinominare SEMPRE il relativo
file in `docs/steps/` aggiungendo il suffisso `.done` prima dell'estensione:

```
00-setup-progetto.md  →  00-setup-progetto.done.md
```

Così il nome del file segnala a colpo d'occhio quali step sono chiusi, mantenendo
intatto l'ordinamento numerico. Aggiornare anche, se utile, l'indice in
`docs/steps/README.md`.

## Convenzioni di codice
- TypeScript strict, niente `any` non giustificati. Mobile-first.
- Import alias `@/*`.
- Solo token del design system (colori/raggi/ombre): niente valori hard-coded.
- Disaccoppiare la logica dei giochi dalla scena 3D (vedi `specs.md` §6.6).

## Comandi
- `npm run dev` — sviluppo (`docker compose up` per l'ambiente Docker)
- `npm run build` · `npm run typecheck` · `npm run lint`
- `npm run format` — Prettier
