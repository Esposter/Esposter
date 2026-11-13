// The navigation denylist is a virtual module of the PWA module, typed by the types it ships
/// <reference types="unplugin-pwa-nuxt/navigation-denylist" />
import type { PushNotificationPayload } from "@esposter/db-schema";
import type { PrecacheEntry } from "@vite-pwa/workbox-swkit/precaching";

import { ExpirationPlugin } from "@vite-pwa/workbox-swkit/expiration";
import { cleanupOutdatedCaches, precacheAndRoute } from "@vite-pwa/workbox-swkit/precaching";
import { NavigationRoute, registerRoute } from "@vite-pwa/workbox-swkit/routing";
import { NetworkFirst } from "@vite-pwa/workbox-swkit/strategies";
import { navigationDenylist } from "virtual:unplugin-pwa-nuxt/navigation-denylist";

// The build replaces `__WB_MANIFEST` with the precache list of the build's own files, each named by its content or
// Carrying its revision. A page is server-rendered, so it comes from the network first and is kept for the moments
// There is none: a page precached once, with no revision, would point at the files of the build it was cached from for as
// Long as the worker lives. A route the server answers itself, such as an API route or a file it serves, is not a
// Page, so the module hands over its routes as the denylist
declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: PrecacheEntry[] };

const MAX_CACHED_PAGES = 32;
const NETWORK_TIMEOUT_SECONDS = 3;

cleanupOutdatedCaches();
// oxlint-disable-next-line no-underscore-dangle -- the build injects this name, and workbox reads it by it
precacheAndRoute(self.__WB_MANIFEST);
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: "pages",
      networkTimeoutSeconds: NETWORK_TIMEOUT_SECONDS,
      plugins: [new ExpirationPlugin({ maxEntries: MAX_CACHED_PAGES })],
    }),
    { denylist: navigationDenylist },
  ),
);

// The update prompt in the tab asks a waiting worker to take over, and the reload follows the new worker taking control
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") event.waitUntil(self.skipWaiting());
});

// The push handler lives here, typed, rather than in an
// `importScripts` file
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const payload: PushNotificationPayload = event.data.json();
  const { body, data, icon, title } = payload;
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
      // oxlint-disable-next-line unicorn/require-post-message-target-origin -- a Client takes no target origin: it is the matched window itself
      for (const client of clients) client.postMessage(payload);
      await self.registration.showNotification(title ?? "", { body, data, icon: icon ?? undefined });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { url }: PushNotificationPayload["data"] = event.notification.data;
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
      for (const client of clients)
        if (client.url === url) {
          await client.focus();
          return;
        }
      await self.clients.openWindow(url);
    })(),
  );
});
