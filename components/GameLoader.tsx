"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { GameLoading } from "@/components/GameLoading";

// Registry dei moduli di gioco: slug → componente caricato on-demand.
// Ogni gioco finisce in un chunk separato (ssr:false perché contiene il
// Canvas 3D che richiede `window`). Aggiungere un gioco = una riga qui.
const GAME_LOADERS: Record<string, ComponentType> = {
  acaan: dynamic(() => import("@/app/acaan/AcaanGame"), {
    ssr: false,
    loading: () => <GameLoading />,
  }),
};

export function GameLoader({ slug }: { slug: string }) {
  const Game = GAME_LOADERS[slug];
  // Slug non mappati sono già gestiti con notFound() dalla pagina (server).
  if (!Game) return null;
  return <Game />;
}
