import { Keyline } from "@/components/Keyline";
import { SuitIcon, type Suit } from "@/components/icons/SuitIcon";
import { AcaanSettingsPanel } from "./AcaanSettingsPanel";

const QUADRANTS: {
  pos: string;
  suit: Suit;
  label: string;
  col: string;
}[] = [
  {
    pos: "Alto · sinistra",
    suit: "hearts",
    label: "Cuori",
    col: "text-wine-600",
  },
  {
    pos: "Alto · destra",
    suit: "diamonds",
    label: "Quadri",
    col: "text-wine-600",
  },
  {
    pos: "Basso · sinistra",
    suit: "clubs",
    label: "Fiori",
    col: "text-ivory-50",
  },
  {
    pos: "Basso · destra",
    suit: "spades",
    label: "Picche",
    col: "text-ivory-50",
  },
];

const VALUE_ROWS: { sec: string; res: string }[] = [
  { sec: "00 · 20 · 40", res: "Carta bianca (lo zero del ciclo)" },
  { sec: "1 – 13", res: "Asso … Re (A, 2 … 10, J, Q, K)" },
  { sec: "14 – 19", res: "Jolly" },
  { sec: "21 – 33", res: "Asso … Re (il ciclo si ripete)" },
  { sec: "34 – 39", res: "Jolly" },
  { sec: "41 – 53", res: "Asso … Re" },
  { sec: "54 – 59", res: "Jolly" },
];

const STEPS: { t: string; d: string }[] = [
  {
    t: "Apri il gioco",
    d: "Il contatore dei secondi parte da 0 e avanza. L'orologio in alto a sinistra sembra un dettaglio innocuo: è il tuo strumento.",
  },
  {
    t: "Fissa la carta",
    d: "Decidi quale carta far apparire — oppure guida lo spettatore verso una che puoi caricare con comodo.",
  },
  {
    t: "Carica il valore",
    d: "Aspetta il secondo giusto. Per i valori 1–13 leggi il secondo così com'è; nei blocchi successivi sottrai mentalmente 20 o 40. Per un Jolly scegli un secondo nelle bande 14–20, 34–40 o 54–00.",
  },
  {
    t: "Carica il seme",
    d: "Dai il comando del seme nel quadrante giusto — sulla carta o sullo schermo, secondo le tue impostazioni. Conta solo il primo: i successivi non cambiano nulla.",
  },
  {
    t: "Rivela",
    d: "Doppio tap sulla carta — quella in cima al mazzo o una già distribuita: si gira e mostra esattamente la carta che hai caricato.",
  },
];

const TIPS: string[] = [
  "L'orologio è la tua ancora: dagli occhiate di sfuggita, non fissarlo mai.",
  "Compra tempo con il discorso (patter): mentre parli, aspetti che il secondo arrivi al punto giusto.",
  "Il comando del seme dev'essere naturale: conta la posizione del primo tocco, non il gesto.",
  "Per far “scegliere” la carta allo spettatore, indirizzalo con domande e influenza verso un valore comodo da caricare.",
  "Puoi girare la carta in cima al mazzo o sfilarne quante vuoi: la prima che giri è quella caricata.",
  "Riservatezza assoluta: niente prove davanti al pubblico. La magia vive nella discrezione.",
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-gold-500/90 font-mono text-xs tracking-[0.18em] uppercase">
      {children}
    </p>
  );
}

export default function AcaanSecret() {
  return (
    <div className="flex flex-col gap-10">
      {/* Intro */}
      <section className="flex flex-col gap-3">
        <Eyebrow>Il segreto</Eyebrow>
        <h1 className="text-display text-display-xl">ACAAN</h1>
        <p className="text-ivory-50/70">
          <span className="text-ivory-50">Any Card At Any Number.</span> Per lo
          spettatore è un miracolo: pensa una carta e, tra tutte, è proprio
          quella a girarsi. In realtà controlli tu due cose, in modo invisibile:
          il <strong className="text-ivory-50 font-semibold">seme</strong> e il{" "}
          <strong className="text-ivory-50 font-semibold">valore</strong>.
        </p>
      </section>

      {/* Il seme */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Eyebrow>Comando 1 — il seme</Eyebrow>
          <h2 className="text-display text-title">Il quadrante</h2>
        </div>
        <p className="text-ivory-50/70">
          Lo spazio è diviso, idealmente, in quattro quadranti. La posizione del{" "}
          <em>primo</em> comando decide il seme della carta. Se leggere quella
          posizione sulla carta o sullo schermo lo scegli più sotto, in{" "}
          <span className="text-ivory-50">Modalità di integrazione</span>.
        </p>
        <Keyline className="p-2">
          <div className="grid grid-cols-2 overflow-hidden rounded-[14px]">
            {QUADRANTS.map((q, i) => (
              <div
                key={q.suit}
                className={`flex items-center gap-3 p-4 ${
                  i % 2 === 0 ? "border-r" : ""
                } ${i < 2 ? "border-b" : ""} border-ivory-50/10`}
              >
                <SuitIcon suit={q.suit} size={30} className={q.col} />
                <span className="flex flex-col">
                  <span className="text-display text-sm">{q.label}</span>
                  <span className="text-ivory-50/55 text-xs">{q.pos}</span>
                </span>
              </div>
            ))}
          </div>
        </Keyline>
      </section>

      {/* Il valore */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Eyebrow>Comando 2 — il valore</Eyebrow>
          <h2 className="text-display text-title">I secondi dell’orologio</h2>
        </div>
        <p className="text-ivory-50/70">
          I secondi sono un contatore che parte da 0 (oppure l’orologio reale
          del telefono, se lo imposti). Il valore della carta segue una
          mappatura ciclica a blocchi di 20.
        </p>
        <Keyline className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-ivory-50/12 text-ivory-50/55 border-b">
                <th className="p-3 font-mono text-xs font-medium tracking-wider uppercase">
                  Secondi
                </th>
                <th className="p-3 font-mono text-xs font-medium tracking-wider uppercase">
                  Carta
                </th>
              </tr>
            </thead>
            <tbody>
              {VALUE_ROWS.map((r) => (
                <tr
                  key={r.sec}
                  className="border-ivory-50/8 border-b last:border-0"
                >
                  <td className="text-gold-300 p-3 font-mono">{r.sec}</td>
                  <td className="text-ivory-50/80 p-3">{r.res}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Keyline>
        <p className="text-ivory-50/55 text-sm">
          Regola pratica:{" "}
          <span className="text-ivory-50/80 font-mono">
            valore = secondi mod 20
          </span>
          . <span className="font-mono">0</span> → carta bianca,{" "}
          <span className="font-mono">1–13</span> → valore della carta,{" "}
          <span className="font-mono">14–19</span> → Jolly. Il mazzo contiene 52
          carte, 2 jolly e 1 bianca (55 in tutto).
        </p>
      </section>

      {/* Modalità di integrazione (configurazione) */}
      <AcaanSettingsPanel />

      {/* Esecuzione */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Eyebrow>La routine</Eyebrow>
          <h2 className="text-display text-title">L’esecuzione</h2>
        </div>
        <ol className="flex flex-col gap-3">
          {STEPS.map((s, i) => (
            <li key={s.t}>
              <Keyline className="flex gap-4 p-4">
                <span className="text-display bg-felt-900/60 text-gold-500 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                  {i + 1}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-display text-sm">{s.t}</span>
                  <span className="text-ivory-50/65 text-sm">{s.d}</span>
                </span>
              </Keyline>
            </li>
          ))}
        </ol>
      </section>

      {/* Consigli */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Eyebrow>Dal palco</Eyebrow>
          <h2 className="text-display text-title">Consigli di presentazione</h2>
        </div>
        <ul className="flex flex-col gap-3">
          {TIPS.map((tip) => (
            <li key={tip} className="text-ivory-50/70 flex gap-3">
              <span aria-hidden className="text-gold-500 mt-1">
                ◆
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="border-ivory-50/10 text-ivory-50/40 border-t pt-6 text-center font-mono text-xs tracking-wider uppercase">
        Tienilo per te.
      </p>
    </div>
  );
}
