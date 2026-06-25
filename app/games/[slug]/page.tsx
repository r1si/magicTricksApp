import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GAMES } from "@/config/games.config";
import { GameLoader } from "@/components/GameLoader";

type Params = { params: Promise<{ slug: string }> };

// Pre-genera staticamente le route dei giochi giocabili.
export function generateStaticParams() {
  return GAMES.filter((g) => g.status === "available").map((g) => ({
    slug: g.slug,
  }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const game = GAMES.find((g) => g.slug === slug);
  return { title: game ? `${game.title} · Trucchi di Magia` : "Gioco" };
}

export default async function GamePage({ params }: Params) {
  const { slug } = await params;
  // Solo i giochi "available" sono raggiungibili: coming-soon e slug
  // inesistenti → 404.
  const game = GAMES.find((g) => g.slug === slug && g.status === "available");
  if (!game) notFound();

  return <GameLoader slug={slug} />;
}
