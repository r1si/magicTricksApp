import { Cinzel, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";

// Display — Cinzel: serif capitalino inciso, evoca i manifesti dei
// prestigiatori. Variable font: niente weight esplicito. Solo MAIUSCOLO.
export const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinzel",
});

// Body — Hanken Grotesk: grotesque umanista, caldo e leggibile. Variable.
export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
});

// Utility/dati — IBM Plex Mono: precisione meccanica per l'orologio del metodo.
// Non è variable: i pesi vanno dichiarati.
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

// Stringa pronta per la <html className>.
export const fontVariables = `${cinzel.variable} ${hanken.variable} ${plexMono.variable}`;
