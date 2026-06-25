// Service worker custom (Cache API nativa) — Turbopack-proof, niente build step.
// Strategie:
//   - navigazioni: network-first con fallback alla offline shell (/offline);
//   - asset statici (_next/static, icone, font, immagini): stale-while-revalidate.

const VERSION = "v2";
const STATIC_CACHE = `static-${VERSION}`;
const PAGES_CACHE = `pages-${VERSION}`;
const OFFLINE_URL = "/offline";

// App shell minima precachata all'installazione.
const PRECACHE = [OFFLINE_URL, "/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGES_CACHE);
      await cache.addAll(PRECACHE);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Abilita la navigation preload (più veloce sul primo fetch online).
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      // Pulisce le cache di versioni precedenti.
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== PAGES_CACHE)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigazioni → network-first: aggiorna la cache della pagina; offline serve
  // la pagina già visitata, poi la offline shell come ultimo fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGES_CACHE);
        try {
          const preload = await event.preloadResponse;
          const fresh = preload || (await fetch(request));
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          return (
            (await cache.match(request)) ??
            (await cache.match(OFFLINE_URL)) ??
            Response.error()
          );
        }
      })(),
    );
    return;
  }

  // Asset statici → stale-while-revalidate.
  const isStatic =
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/icons") ||
    ["font", "style", "script", "image"].includes(request.destination);

  if (isStatic) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res && res.status === 200) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached ?? network;
      })(),
    );
  }
});
