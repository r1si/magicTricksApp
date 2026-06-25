import { notFound } from "next/navigation";
import { Keyline } from "@/components/Keyline";
import { Button } from "@/components/Button";
import { SuitIcon, type Suit } from "@/components/icons/SuitIcon";
import { LockIcon } from "@/components/icons/LockIcon";

// Riferimento visivo interno: disponibile solo in sviluppo.
export const metadata = { title: "Styleguide · Trucchi di Magia" };

const BRAND_COLORS = [
  ["felt-500", "bg-felt-500"],
  ["felt-700", "bg-felt-700"],
  ["felt-900", "bg-felt-900"],
  ["royal-500", "bg-royal-500"],
  ["royal-700", "bg-royal-700"],
  ["ivory-50", "bg-ivory-50"],
  ["ivory-100", "bg-ivory-100"],
  ["wine-500", "bg-wine-500"],
  ["wine-600", "bg-wine-600"],
  ["gold-300", "bg-gold-300"],
  ["gold-500", "bg-gold-500"],
  ["surface", "bg-surface"],
] as const;

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-display text-title">{title}</h2>
      <Keyline className="p-5">{children}</Keyline>
    </section>
  );
}

export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 p-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-display text-display-xl">Trucchi di Magia</h1>
        <p className="text-ivory-50/60">
          Styleguide del design system — solo in sviluppo.
        </p>
      </header>

      <Section title="Colori">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {BRAND_COLORS.map(([name, bg]) => (
            <div key={name} className="flex flex-col gap-2">
              <div
                className={`border-ivory-50/10 h-14 rounded-md border ${bg}`}
              />
              <span className="text-ivory-50/70 font-mono text-xs">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tipografia">
        <div className="flex flex-col gap-4">
          <p className="text-display text-display-xl">Display · Cinzel</p>
          <p className="text-display text-title">Titolo gioco · Cinzel</p>
          <h3 className="text-xl font-semibold">H2 sezione · Hanken Grotesk</h3>
          <p>
            Body · Hanken Grotesk. Caldo, leggibile, moderno — il testo corrente
            su feltro scuro con line-height comodo.
          </p>
          <p className="text-ivory-50/60 text-sm font-medium">
            Caption / etichetta · Hanken Grotesk
          </p>
          <p className="text-ivory-50/60 font-mono text-sm">
            14:32:07 · IBM Plex Mono (orologio del metodo)
          </p>
        </div>
      </Section>

      <Section title="Bottoni">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Rivela la carta</Button>
          <Button variant="secondary">Torna alla collezione</Button>
          <Button variant="primary" disabled>
            Disabilitato
          </Button>
        </div>
      </Section>

      <Section title="Cornice avorio (firma)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Keyline className="p-4">
            <p className="text-ivory-50/70 text-sm">Superficie a riposo</p>
          </Keyline>
          <Keyline active className="p-4">
            <p className="text-ivory-50/70 text-sm">Superficie attiva</p>
          </Keyline>
        </div>
      </Section>

      <Section title="Iconografia">
        <div className="flex flex-wrap items-center gap-6">
          {SUITS.map((suit) => (
            <SuitIcon
              key={suit}
              suit={suit}
              size={32}
              className={
                suit === "hearts" || suit === "diamonds"
                  ? "text-wine-600"
                  : "text-ivory-50"
              }
            />
          ))}
          <LockIcon size={32} className="text-ivory-50/70" />
        </div>
      </Section>
    </main>
  );
}
