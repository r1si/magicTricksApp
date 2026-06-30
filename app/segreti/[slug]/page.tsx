import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { SECRETS } from "@/config/secrets.config";
import AcaanSecret from "../_content/acaan";

// Registro dei contenuti: slug → dossier. I segreti sono pagine statiche
// (nessun 3D) → server component, ottime per perf/SEO.
const CONTENT: Record<string, ComponentType> = {
  acaan: AcaanSecret,
};

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SECRETS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = SECRETS.find((x) => x.slug === slug);
  return {
    title: s ? `Il segreto di ${s.title} · Trucchi di Magia` : "Segreto",
  };
}

export default async function SecretPage({ params }: Params) {
  const { slug } = await params;
  const Content = CONTENT[slug];
  if (!Content) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8">
      <Link
        href="/"
        className="text-ivory-50/60 hover:text-ivory-50 inline-flex items-center gap-2 self-start text-sm transition-colors"
      >
        <span aria-hidden>←</span> Torna alla collezione
      </Link>
      <Content />
    </main>
  );
}
