import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output ottimizzato per l'immagine Docker di produzione (runner snello).
  output: "standalone",
  // Permette al dev server di servire gli asset /_next/* quando l'app è esposta
  // tramite tunnel ngrok (hostname diverso da localhost). Solo in sviluppo.
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.app", "*.ngrok.io"],
};

export default nextConfig;
