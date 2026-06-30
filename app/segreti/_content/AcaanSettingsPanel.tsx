"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { SuitIcon, type Suit } from "@/components/icons/SuitIcon";
import {
  useAcaanSettings,
  DEFAULT_SETTINGS,
  type AcaanSettings,
  type StartMode,
  type QuadrantRef,
  type ClockRef,
} from "@/app/acaan/state/settings";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-gold-500/90 font-mono text-xs tracking-[0.18em] uppercase">
      {children}
    </p>
  );
}

// Mappa quadrante → seme, come nel metodo (resolveCard.suitFromQuadrant).
const QUAD: { suit: Suit; col: string; at: string }[] = [
  { suit: "hearts", col: "text-wine-600", at: "top-2 left-2" },
  { suit: "diamonds", col: "text-wine-600", at: "top-2 right-2" },
  { suit: "clubs", col: "text-ivory-50", at: "bottom-2 left-2" },
  { suit: "spades", col: "text-ivory-50", at: "bottom-2 right-2" },
];

/** Immagine (still dal gioco) con i 4 quadranti dei semi sovrapposti. */
function QuadrantFigure({
  src,
  ratio,
  caption,
}: {
  src: string;
  ratio: string;
  caption: string;
}) {
  return (
    <figure className="flex flex-col gap-2">
      <div
        className="keyline relative overflow-hidden p-0"
        style={{ aspectRatio: ratio }}
      >
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, 240px"
          className="object-cover"
        />
        {/* Linee dei quadranti */}
        <span className="bg-ivory-50/30 absolute inset-y-0 left-1/2 w-px" />
        <span className="bg-ivory-50/30 absolute inset-x-0 top-1/2 h-px" />
        {/* Glifi dei semi negli angoli */}
        {QUAD.map((q) => (
          <span
            key={q.suit}
            className={`bg-felt-900/55 absolute ${q.at} rounded-full p-1.5`}
          >
            <SuitIcon suit={q.suit} size={18} className={q.col} />
          </span>
        ))}
      </div>
      <figcaption className="text-ivory-50/55 text-center text-xs">
        {caption}
      </figcaption>
    </figure>
  );
}

type Option<T extends string> = {
  value: T;
  label: string;
  desc: string;
  note?: string;
};

function SettingGroup<T extends string>({
  eyebrow,
  title,
  intro,
  options,
  value,
  defaultValue,
  onChange,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  options: Option<T>[];
  value: T;
  defaultValue: T;
  onChange: (v: T) => void;
  children?: React.ReactNode;
}) {
  const note = options.find((o) => o.value === value)?.note;
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h3 className="text-display text-title">{title}</h3>
      </div>
      <p className="text-ivory-50/70">{intro}</p>
      {children}
      <div
        role="radiogroup"
        aria-label={title}
        className="grid gap-3 sm:grid-cols-2"
      >
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(o.value)}
              className={`keyline ${selected ? "keyline-active" : ""} flex flex-col gap-1.5 p-4 text-left transition-[border-color,transform] duration-150 ease-out active:scale-[0.99]`}
            >
              <span className="flex items-center justify-between gap-2">
                <span
                  className={`text-display text-sm ${selected ? "text-gold-300" : "text-ivory-50"}`}
                >
                  {o.label}
                </span>
                <span className="flex items-center gap-1.5">
                  {o.value === defaultValue && (
                    <span className="text-ivory-50/45 font-mono text-[0.6rem] tracking-wider uppercase">
                      default
                    </span>
                  )}
                  <span
                    aria-hidden
                    className={`grid h-4 w-4 place-items-center rounded-full border text-[0.6rem] ${
                      selected
                        ? "border-gold-500 text-gold-300"
                        : "border-ivory-50/30 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </span>
              </span>
              <span className="text-ivory-50/60 text-xs">{o.desc}</span>
            </button>
          );
        })}
      </div>
      {note && (
        <p className="border-gold-500/40 text-gold-300/90 bg-gold-500/5 rounded-md border-l-2 px-3 py-2 text-sm">
          {note}
        </p>
      )}
    </section>
  );
}

/**
 * Pannello di configurazione del trucco: il mago sceglie COME integrare i
 * comandi. Le scelte persistono (localStorage) e il gioco le legge. Render
 * stabile lato server (valori di default) finché non è montato sul client →
 * niente mismatch di idratazione con i valori salvati.
 */
// True solo sul client (dopo l'idratazione): senza setState in un effetto, così
// il primo render client combacia col server (entrambi mostrano i default).
function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function AcaanSettingsPanel() {
  const hydrated = useHydrated();

  const live = useAcaanSettings();
  const s: AcaanSettings = hydrated ? live : DEFAULT_SETTINGS;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Eyebrow>La tua messinscena</Eyebrow>
        <h2 className="text-display text-title">Modalità di integrazione</h2>
        <p className="text-ivory-50/70">
          Scegli come dare i due comandi — seme e valore — e quale orologio
          usare. Le impostazioni restano salvate e valgono per le prossime
          partite.
        </p>
      </div>

      <SettingGroup<StartMode>
        eyebrow="L'avvio"
        title="Modalità di partenza"
        intro="Come comincia il gioco. Variare l'avvio sposta l'attenzione dello spettatore lontano dall'orologio."
        value={s.startMode}
        defaultValue={DEFAULT_SETTINGS.startMode}
        onChange={live.setStartMode}
        options={[
          {
            value: "deck",
            label: "Mazzo",
            desc: "Si parte direttamente dal mazzo sul feltro (comportamento classico).",
            note: "Comando 2 (valore): i secondi si fissano all'inizio dello swipe della prima carta — come ora.",
          },
          {
            value: "box",
            label: "Scatolina",
            desc: "Il mazzo parte dentro la scatola aperta; lo spettatore la estrae con uno swipe verso il basso.",
            note: "Comando 2 (valore): i secondi si fissano sullo swipe con cui estrai la scatola. Subito dopo orologio e uscita spariscono per il resto della partita.",
          },
        ]}
      />

      <SettingGroup<QuadrantRef>
        eyebrow="Comando 1 — il seme"
        title="Quadrante di riferimento"
        intro="Dove leggere i quattro quadranti che fissano il seme della carta."
        value={s.quadrant}
        defaultValue={DEFAULT_SETTINGS.quadrant}
        onChange={live.setQuadrant}
        options={[
          {
            value: "card",
            label: "Carta",
            desc: "Il seme nasce dal punto in cui tocchi la prima carta. Vale a swipe completato o al doppio tap.",
          },
          {
            value: "screen",
            label: "Schermo",
            desc: "Il seme nasce dal quadrante dello schermo al primo tocco: una volta premuto, la scelta è fatta.",
          },
        ]}
      >
        <div className="grid grid-cols-2 gap-4">
          <QuadrantFigure
            src="/segreti/acaan/card.png"
            ratio="180 / 215"
            caption="Carta — dove tocchi sul mazzo"
          />
          <QuadrantFigure
            src="/segreti/acaan/screen.png"
            ratio="272 / 360"
            caption="Schermo — quadrante al primo tocco"
          />
        </div>
      </SettingGroup>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Eyebrow>Comando 2 — il valore</Eyebrow>
          <h3 className="text-display text-title">Tempo</h3>
        </div>
        <p className="text-ivory-50/70">
          I secondi che fissano il valore si bloccano sempre all’inizio del
          gesto — l’istante che scegli — e valgono solo se completi il gesto. Il
          momento esatto dipende dalla modalità di partenza: in{" "}
          <strong className="text-ivory-50">mazzo</strong> è l’inizio dello
          swipe della prima carta; in{" "}
          <strong className="text-ivory-50">scatolina</strong> è lo swipe con
          cui estrai la scatola.
        </p>
      </section>

      <SettingGroup<ClockRef>
        eyebrow="Lo strumento"
        title="Orologio"
        intro="Quale orologio fornisce i secondi del valore."
        value={s.clock}
        defaultValue={DEFAULT_SETTINGS.clock}
        onChange={live.setClock}
        options={[
          {
            value: "app",
            label: "In app",
            desc: "Contatore discreto in alto a sinistra. Il gioco prova ad andare a tutto schermo.",
          },
          {
            value: "phone",
            label: "Telefono",
            desc: "Il valore segue i secondi reali dell'orologio di sistema.",
            note: "Ricordati di attivare i secondi nell'orologio del tuo dispositivo: senza, non puoi leggere il valore.",
          },
        ]}
      />
    </section>
  );
}
