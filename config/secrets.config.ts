// Registro dei "segreti": i giochi che hanno un dossier del mago.
// Alimenta il menu del pulsante segreto e le route /segreti/[slug].
export type Secret = {
  slug: string;
  title: string;
  subtitle: string;
};

export const SECRETS: Secret[] = [
  { slug: "acaan", title: "ACAAN", subtitle: "Any Card At Any Number" },
  // I prossimi dossier si aggiungono qui.
];
