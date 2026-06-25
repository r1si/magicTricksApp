import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output ottimizzato per l'immagine Docker di produzione (runner snello).
  output: "standalone",
};

export default nextConfig;
