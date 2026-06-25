"use client";

import { useEffect } from "react";

/**
 * Registra il service worker dopo il load. Attivo solo in produzione: in
 * sviluppo il SW interferirebbe con l'hot reload.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registrazione fallita: l'app resta utilizzabile online.
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
