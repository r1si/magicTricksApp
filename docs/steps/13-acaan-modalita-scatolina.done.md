# Step 13 — ACAAN: modalità di partenza (mazzo / scatolina)

## Obiettivo
Rafforzare la misdirection (l'attenzione non deve cadere sull'orologio) dando al
mago una **modalità di partenza** scelta nel dossier segreto, e semplificare il
comando del valore.

## Attività svolte
1. **Comando 2 (valore) semplificato.** Rimossa l'opzione "su prima carta / su
   carta girata": il valore si fissa sempre all'inizio del gesto scelto.
   - `state/settings.ts`: via `TimeRef`/`time`/`setTime`.
   - `AcaanGame.tsx`: `commitSeconds` cattura sempre i secondi.
   - `state/store.ts`: il ripiego `valueSeconds ?? currentSeconds` resta (innocuo).
   - `AcaanSettingsPanel.tsx`: gruppo "Tempo" sostituito da una nota esplicativa.
2. **Setting `startMode` (`deck` | `box`)** persistente (default `deck`), con
   migrazione `persist` v1→v2. Nuovo gruppo "Modalità di partenza" nel dossier.
3. **Modalità scatolina.** Vista e camera **invariate**: all'avvio il mazzo è
   quello di sempre, avvolto da una custodia aperta.
   - `scene/Scatolina.tsx`: custodia aperta (avorio, `MeshStandardMaterial`) con
     sponde basse attorno al mazzo piatto e coperchio aperto ribaltato dietro,
     con `/cards/front-deck.png` (`useTexture`/sRGB, come il dorso). Si **trascina
     come una carta** (raycaster sul piano del tavolo, fisica a molla) e al
     rilascio **scivola fuori dallo schermo**; poi smonta → fase `play`. Un
     catcher invisibile cattura lo swipe ovunque e scherma il mazzo sotto.
   - `AcaanGame.tsx`: fase `box-intro` → grab della scatola fissa l'istante,
     rilascio conferma il valore ("selezione dalla scatola") → fase `play`. Il
     `Deck` resta sempre montato (nessun cambio di camera).
   - Dopo lo swipe **orologio e X restano nascosti** per tutta la partita:
     `lib/gameChrome.ts` + `components/GameCloseButton.tsx` (X del layout) e
     fade dell'orologio in `AcaanGame.tsx`.

## Criteri di accettazione
- `npm run typecheck` · `npm run lint` · `npm run build` puliti. ✅
- `npm run test` (vitest) verde; test del valore aggiornati. ✅
- Mazzo: gioco invariato. Scatolina: il mazzo di sempre dentro la custodia;
  trascinandola verso il basso e mollando, esce dallo schermo, il chrome svanisce
  e resta nascosto, e il mazzo resta pronto al gioco.

## Note
Proporzioni custodia, altezza sponde, angolo del coperchio e traiettoria d'uscita
(`scene/Scatolina.tsx` — costanti `MARGIN`, `WALL_H`, `LID_*`, `OFF`) sono tarati
a vista: rifinire sul dispositivo se serve.
