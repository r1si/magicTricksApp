import type { MetadataRoute } from "next";

// Next.js serve questo come /manifest.webmanifest e aggiunge automaticamente
// il <link rel="manifest"> in <head>.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trucchi di Magia",
    short_name: "Magia",
    description:
      "Una collezione di trucchi di magia interattivi. Primo gioco: ACAAN.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "it",
    dir: "ltr",
    categories: ["games", "entertainment"],
    background_color: "#15603E", // felt-700 (splash)
    theme_color: "#0E4D34", // felt-900 (barra di sistema)
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-256.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
