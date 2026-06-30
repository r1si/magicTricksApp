"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SUITS, type Card } from "@/lib/cards";
import { useGameChrome } from "@/lib/gameChrome";
import { useAcaanStore } from "./state/store";
import { useAcaanSettings } from "./state/settings";
import { methodSeconds, realSeconds } from "./logic/clock";
import { MethodClock } from "./components/MethodClock";
import { PhoneClockNotice } from "./components/PhoneClockNotice";
import DeckScene from "./scene/DeckScene";
import { DECK_COUNT } from "./scene/decks/cardModel";
import { overlaps, separationVector } from "./scene/decks/collision";
import {
  initialCardControl,
  initialCardXform,
  type CardControl,
  type CardXform,
  type DealtCard,
} from "./scene/decks/types";

// Limiti del feltro entro cui resta una carta spinta via (lontano dal mazzo).
const TABLE_HALF_X = 0.62;
const TABLE_MIN_Z = 0.45; // davanti al mazzo
const TABLE_MAX_Z = 1.25;
// Ritardo prima del flip quando una carta sopra deve prima scivolare via.
const SLIDE_MS = 280;

type Phase = "box-intro" | "play";
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

// Mazzo standard (52 carte, niente jolly) per le carte "di contorno": quelle
// girate dopo la prima sono pescate qui, distinte tra loro e dalla carta-metodo.
const FULL_DECK: Card[] = SUITS.flatMap((suit) =>
  Array.from({ length: 13 }, (_, i) => ({ suit, value: i + 1 })),
);
const cardKey = (c: Card) => `${c.suit}-${c.value}`;

/** Pesca una carta a caso distinta da tutte quelle già usate. */
function pickRandomCard(used: Card[]): Card {
  const seen = new Set(used.map(cardKey));
  const pool = FULL_DECK.filter((c) => !seen.has(cardKey(c)));
  const source = pool.length > 0 ? pool : FULL_DECK;
  return source[Math.floor(Math.random() * source.length)];
}

// Gioco ACAAN. Caricato on-demand (ssr:false) dal GameLoader → solo client.
//
// Il QUANDO/DOVE si fissano seme e valore dipende dalle impostazioni di
// integrazione (state/settings.ts), scelte dal mago nel dossier:
//  • Modalità di partenza: "mazzo" → si gioca subito col mazzo; "scatolina" → il
//    mazzo parte dentro la scatola aperta e si estrae con uno swipe verso il
//    basso (è lì che si fissa il valore; poi orologio e X spariscono).
//  • Quadrante (seme): "schermo" → al primo tocco, dalla posizione sullo schermo;
//    "carta" → dalla posizione del tocco sulla prima carta, valido a swipe
//    completato o doppio tap.
//  • Valore: i secondi si fissano sempre all'inizio del gesto scelto (lo swipe
//    della prima carta in mazzo; lo swipe della scatola in scatolina).
//  • Orologio: "app" → contatore interno (full screen best-effort); "telefono" →
//    secondi reali del sistema (con promemoria).
export default function AcaanGame() {
  // Stato transiente del drag (no re-render): la scena lo legge in useFrame e
  // proietta l'NDC sul piano del tavolo.
  const controlRef = useRef<CardControl>(initialCardControl());
  // Posa corrente della carta attiva, aggiornata dalla scena: serve ad
  // archiviarla quando se ne distribuisce una nuova.
  const activeXform = useRef<CardXform>(initialCardXform());
  // Contenitore del gioco: riferimento per il quadrante "schermo" e il fullscreen.
  const containerRef = useRef<HTMLDivElement>(null);

  // Chiave di rimontaggio della carta attiva: sale a ogni distribuzione (una
  // nuova carta a dorso emerge dalla cima del mazzo).
  const [activeKey, setActiveKey] = useState(0);
  // Carte sfilate dal mazzo e lasciate sul feltro (a dorso finché non girate).
  const [dealt, setDealt] = useState<DealtCard[]>([]);
  // Carte ancora nel mazzo (attiva inclusa): scende a ogni distribuzione, da 55
  // a 0. A 0 la pila sparisce. 55 = 52 + 2 jolly + 1 bianca.
  const [remaining, setRemaining] = useState(DECK_COUNT);
  // Carta in cima al mazzo: si può girare in posa (doppio tap) senza sfilarla.
  const [topRevealed, setTopRevealed] = useState(false);
  const [topFace, setTopFace] = useState<Card | null>(null);
  // Specchio dello stato della carta in cima: lo leggo in handleDeal per sapere
  // se va archiviata già scoperta (sfilata dopo la rivelazione).
  const topRef = useRef<{ revealed: boolean; face: Card | null }>({
    revealed: false,
    face: null,
  });
  useEffect(() => {
    topRef.current = { revealed: topRevealed, face: topFace };
  }, [topRevealed, topFace]);
  const nextId = useRef(0);
  // Specchio della lista, sempre aggiornato: lo leggo negli handler per calcolare
  // le collisioni senza dipendere dalle chiusure di React.
  const dealtRef = useRef<DealtCard[]>([]);
  useEffect(() => {
    dealtRef.current = dealt;
  }, [dealt]);
  // Facce già rivelate (in ordine: la prima è la carta del metodo): servono a
  // pescare carte sempre distinte dalla seconda in poi.
  const revealedFaces = useRef<Card[]>([]);
  // Ultimo punto premuto sulla carta in cima, in uv 0..1 (modalità "carta").
  const pendingDownUv = useRef<{ u: number; v: number } | null>(null);
  // Secondi letti all'INIZIO del gesto (pressione/inizio swipe): è l'istante che
  // il mago controlla. Diventano validi solo se il gesto si completa (deal); se
  // annulli rimettendo la carta in cima, restano non confermati.
  const pendingSeconds = useRef<number | null>(null);
  // Fullscreen tentato una sola volta (richiede un gesto utente).
  const fullscreenTried = useRef(false);

  // Solo il setting d'orologio guida il render (mostra/nasconde l'orologio in app
  // o il promemoria del telefono); gli altri si leggono al volo negli handler.
  const clock = useAcaanSettings((s) => s.clock);
  // Modalità di partenza: in "box" il gioco parte con la scatolina da estrarre.
  const startMode = useAcaanSettings((s) => s.startMode);

  // Fase: in modalità mazzo si gioca subito; in scatolina si parte dall'intro
  // della scatola e si passa a "play" quando viene estratta.
  const [phase, setPhase] = useState<Phase>(() =>
    useAcaanSettings.getState().startMode === "box" ? "box-intro" : "play",
  );
  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  // Swipe d'estrazione avviato: la scatola scivola fuori e il chrome svanisce.
  const [boxDismissed, setBoxDismissed] = useState(false);

  const setChromeHidden = useGameChrome((s) => s.setHidden);

  // Debug (?debug=box): mostra solo il modello 3D dell'astuccio, isolato e
  // orbitabile — utile per rifinirne la geometria senza il resto della scena.
  const [debugBox] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("debug") === "box",
  );

  useEffect(() => {
    useAcaanStore.getState().start();
  }, []);

  // La X di uscita (chrome del layout) resta visibile durante l'intro scatola e
  // sparisce appena parte lo swipe d'estrazione, per tutta la partita. Ripristina
  // alla chiusura del gioco così non influenza gli altri giochi.
  useEffect(() => {
    if (startMode === "box") setChromeHidden(boxDismissed);
  }, [startMode, boxDismissed, setChromeHidden]);
  useEffect(() => () => setChromeHidden(false), [setChromeHidden]);

  // Solo in sviluppo: espone lo store per i test E2E (mai in produzione,
  // svelerebbe il metodo segreto).
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __acaanStore?: unknown }).__acaanStore =
        useAcaanStore;
    }
  }, []);

  // Secondi correnti del metodo, secondo l'orologio scelto: contatore interno
  // ("app") oppure orologio reale di sistema ("telefono").
  const secondsNow = useCallback(() => {
    if (useAcaanSettings.getState().clock === "phone") {
      return realSeconds(Date.now());
    }
    const startedAt = useAcaanStore.getState().startedAt ?? Date.now();
    return methodSeconds(startedAt, Date.now());
  }, []);

  // Fissa il seme dalla posizione sulla carta (uv) — solo modalità "carta".
  const commitCardSuit = useCallback(() => {
    if (useAcaanSettings.getState().quadrant !== "card") return;
    const uv = pendingDownUv.current;
    if (uv) useAcaanStore.getState().captureSuit(uv.u, uv.v, 1, 1);
  }, []);

  // Conferma i secondi del valore. Il valore è quello letto all'inizio del gesto
  // scelto (swipe della prima carta o della scatola), non al rilascio.
  const commitSeconds = useCallback((seconds: number) => {
    useAcaanStore.getState().captureSeconds(seconds);
  }, []);

  // Inizio del gesto sulla scatola: l'istante scelto dal mago. I secondi del
  // valore si fissano qui ("sulla selezione dalla scatola"), validi al rilascio.
  const handleBoxGrab = useCallback(() => {
    pendingSeconds.current = secondsNow();
  }, [secondsNow]);

  // Swipe d'estrazione completato: i secondi diventano validi e parte l'uscita
  // della scatola; orologio e X svaniscono e restano nascosti per la partita.
  const handleBoxReleased = useCallback(() => {
    commitSeconds(pendingSeconds.current ?? secondsNow());
    setBoxDismissed(true);
  }, [commitSeconds, secondsNow]);

  // Primo gesto sul contenitore: full screen best-effort (modalità "app") e,
  // in modalità quadrante "schermo", fissa subito il seme (e il valore se il
  // tempo è "prima carta") dalla posizione del tocco sullo schermo.
  const handleContainerPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!fullscreenTried.current) {
        fullscreenTried.current = true;
        if (useAcaanSettings.getState().clock === "app") {
          const el = document.documentElement;
          const req = el.requestFullscreen?.bind(el);
          if (req) req().catch(() => {});
        }
      }

      if (phaseRef.current === "box-intro") {
        // Il drag della scatola è gestito dalla scena 3D (Scatolina): qui niente
        // comando del quadrante né cattura del puntatore (la scena deve riceverlo).
        return;
      }

      if (useAcaanSettings.getState().quadrant !== "screen") return;
      const el = containerRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        useAcaanStore
          .getState()
          .captureSuit(
            e.clientX - r.left,
            e.clientY - r.top,
            r.width,
            r.height,
          );
      }
      commitSeconds(secondsNow()); // "il comando è preso al primo tocco"
    },
    [commitSeconds, secondsNow],
  );

  // La scena segnala dove (uv) è stata premuta la carta in cima all'INIZIO del
  // gesto: registro anche i secondi di quell'istante (il momento che il mago
  // sceglie), da confermare solo se lo swipe si completa.
  const handlePointerDownInfo = useCallback(
    (info: { u: number; v: number }) => {
      pendingDownUv.current = info;
      pendingSeconds.current = secondsNow();
    },
    [secondsNow],
  );

  // Carta sfilata dal mazzo (swipe completato). Due casi:
  //  • carta a dorso → è il "comando del quadrante" (modalità "carta"): fissa il
  //    seme e, se il tempo è "prima carta", i secondi; viene archiviata a dorso.
  //  • carta già girata in cima → la archivia SCOPERTA (con la sua faccia), senza
  //    rivelazioni: serve a mostrare che le altre carte sono diverse.
  // In entrambi i casi sale una nuova carta (a dorso) in cima.
  const handleDeal = useCallback(
    (pose: CardXform) => {
      const top = topRef.current;
      const wasRevealed = top.revealed;
      const face = wasRevealed ? top.face : null;
      if (!wasRevealed) {
        commitCardSuit();
        // Secondi letti all'inizio dello swipe (non al rilascio); ora che il
        // gesto si è completato diventano validi.
        commitSeconds(pendingSeconds.current ?? secondsNow());
      }
      // id calcolato fuori dall'updater (che StrictMode può invocare due volte).
      const id = nextId.current++;
      setDealt((list) => [
        ...list,
        {
          id,
          x: pose.x,
          z: pose.z,
          rotZ: pose.rotZ,
          revealed: wasRevealed,
          face,
        },
      ]);
      if (wasRevealed) {
        // La carta scoperta è stata archiviata: la cima torna a dorso, pulita.
        topRef.current = { revealed: false, face: null };
        setTopRevealed(false);
        setTopFace(null);
      }
      // Una carta in meno nel mazzo: la pila si abbassa (a 0 sparisce).
      setRemaining((r) => Math.max(0, r - 1));
      setActiveKey((k) => k + 1);
    },
    [commitCardSuit, commitSeconds, secondsNow],
  );

  // Carte uscite dallo schermo: le rimuovo dal feltro (performance con 55 carte).
  const handleCull = useCallback((ids: number[]) => {
    const drop = new Set(ids);
    setDealt((list) => list.filter((d) => !drop.has(d.id)));
  }, []);

  // Risolve la prossima faccia da rivelare e la registra. La PRIMA girata (di
  // qualunque carta, distribuita o in cima) è la carta del metodo: lo store usa
  // i secondi fissati (tempo "prima carta") oppure quelli correnti passati ora
  // (tempo "carta girata"). Dalla seconda in poi è una carta casuale distinta.
  // Ritorna null se manca il seme (nessun comando del quadrante).
  const resolveNextFace = useCallback((): Card | null => {
    let face: Card | null;
    if (revealedFaces.current.length === 0) {
      useAcaanStore.getState().reveal(secondsNow());
      face = useAcaanStore.getState().resolvedCard;
    } else {
      face = pickRandomCard(revealedFaces.current);
    }
    if (!face) return null;
    revealedFaces.current = [...revealedFaces.current, face];
    return face;
  }, [secondsNow]);

  // Doppio tap sulla carta in cima al mazzo: la gira in posa (senza sfilarla).
  // È anche un possibile "comando del quadrante" (modalità "carta") e, se è la
  // prima carta girata, il momento di lettura dei secondi (tempo "carta girata").
  const handleRevealTop = useCallback(() => {
    if (topRevealed) return;
    commitCardSuit();
    commitSeconds(pendingSeconds.current ?? secondsNow());
    const face = resolveNextFace();
    if (!face) return;
    setTopFace(face);
    setTopRevealed(true);
  }, [topRevealed, commitCardSuit, commitSeconds, resolveNextFace, secondsNow]);

  // Doppio tap su una carta distribuita: la gira. Se la carta scelta è coperta da
  // carte distribuite dopo, quelle scivolano via prima (separazione AABB/MTV),
  // poi parte il flip.
  const handleRevealCard = useCallback(
    (id: number) => {
      const list = dealtRef.current;
      const idx = list.findIndex((d) => d.id === id);
      if (idx < 0 || list[idx].revealed) return;
      const target = list[idx];

      const face = resolveNextFace();
      if (!face) return; // nessun seme → niente rivelazione

      // Carte distribuite DOPO la scelta (quindi sopra) che la coprono: le spingo
      // via lungo l'asse più corto, tenendole sul feltro e lontane dal mazzo.
      const shoved = new Map<number, { x: number; z: number }>();
      for (let i = idx + 1; i < list.length; i++) {
        const c = list[i];
        if (!overlaps(c, target)) continue;
        const { dx, dz } = separationVector(c, target);
        shoved.set(c.id, {
          x: clamp(c.x + dx, -TABLE_HALF_X, TABLE_HALF_X),
          z: clamp(c.z + dz, TABLE_MIN_Z, TABLE_MAX_Z),
        });
      }

      if (shoved.size > 0) {
        // 1) fai scivolare via le carte sopra…
        setDealt((l) =>
          l.map((d) => {
            const p = shoved.get(d.id);
            return p ? { ...d, x: p.x, z: p.z } : d;
          }),
        );
        // 2) …poi gira la carta scelta.
        window.setTimeout(() => {
          setDealt((l) =>
            l.map((d) => (d.id === id ? { ...d, revealed: true, face } : d)),
          );
        }, SLIDE_MS);
      } else {
        setDealt((l) =>
          l.map((d) => (d.id === id ? { ...d, revealed: true, face } : d)),
        );
      }
    },
    [resolveNextFace],
  );

  // Debug dell'astuccio: scena isolata, niente chrome né logica di gioco.
  if (debugBox) {
    return (
      <div className="relative min-h-0 flex-1 touch-none select-none">
        <DeckScene
          debugBox
          phase={phase}
          onBoxGrab={handleBoxGrab}
          onBoxReleased={handleBoxReleased}
          onBoxExited={() => setPhase("play")}
          dealt={dealt}
          control={controlRef}
          activeXform={activeXform}
          activeKey={activeKey}
          remaining={remaining}
          topFace={topFace}
          topRevealed={topRevealed}
          onDeal={handleDeal}
          onRevealCard={handleRevealCard}
          onRevealTop={handleRevealTop}
          onPointerDownInfo={handlePointerDownInfo}
          onCull={handleCull}
        />
      </div>
    );
  }

  // In modalità mazzo il chrome è sempre presente (come ora); in scatolina
  // l'orologio si vede solo durante l'intro e svanisce con lo swipe.
  const showChrome = startMode === "deck" || phase === "box-intro";

  return (
    <div
      ref={containerRef}
      onPointerDownCapture={handleContainerPointerDown}
      className="relative min-h-0 flex-1 touch-none select-none"
    >
      <DeckScene
        phase={phase}
        onBoxGrab={handleBoxGrab}
        onBoxReleased={handleBoxReleased}
        onBoxExited={() => setPhase("play")}
        dealt={dealt}
        control={controlRef}
        activeXform={activeXform}
        activeKey={activeKey}
        remaining={remaining}
        topFace={topFace}
        topRevealed={topRevealed}
        onDeal={handleDeal}
        onRevealCard={handleRevealCard}
        onRevealTop={handleRevealTop}
        onPointerDownInfo={handlePointerDownInfo}
        onCull={handleCull}
      />

      {showChrome && (
        <div
          className="transition-opacity duration-500"
          style={{ opacity: boxDismissed ? 0 : 1 }}
        >
          {clock === "app" ? <MethodClock /> : <PhoneClockNotice />}
        </div>
      )}

      {startMode === "box" && phase === "box-intro" && (
        <p
          aria-hidden="true"
          className="text-ivory-50/70 pointer-events-none absolute inset-x-0 bottom-[max(2rem,env(safe-area-inset-bottom))] z-10 text-center text-sm tracking-wide transition-opacity duration-500"
          style={{ opacity: boxDismissed ? 0 : 1 }}
        >
          Estrai la scatolina per iniziare.
        </p>
      )}
    </div>
  );
}
