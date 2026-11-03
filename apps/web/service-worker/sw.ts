// The navigation denylist is a virtual module of the PWA module, typed by the types it ships
/// <reference types="unplugin-pwa-nuxt/navigation-denylist" />
import type { PushNotificationPayload } from "@esposter/db-schema";
import type { PrecacheEntry } from "@vite-pwa/workbox-swkit/precaching";

import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "@vite-pwa/workbox-swkit/precaching";
import { NavigationRoute, registerRoute } from "@vite-pwa/workbox-swkit/routing";
import { navigationDenylist } from "virtual:unplugin-pwa-nuxt/navigation-denylist";

// The build replaces `__WB_MANIFEST` with the precache list, and the home page joins it, so an offline
// Navigation to any route is answered by the app shell, except one the server answers itself: an API route or a
// File it serves is the server's to answer, so the module hands over its routes as the denylist
declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: PrecacheEntry[] };

cleanupOutdatedCaches();
// oxlint-disable-next-line no-underscore-dangle -- the build injects this name, and workbox reads it by it
precacheAndRoute([...self.__WB_MANIFEST, { revision: null, url: "/" }]);
registerRoute(new NavigationRoute(createHandlerBoundToURL("/"), { denylist: navigationDenylist }));

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
