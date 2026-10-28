import type { PushNotificationPayload } from "@esposter/db-schema";
import type { PrecacheEntry } from "workbox-precaching";

import { getSynchronizedFunction } from "@esposter/shared";
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

// The build replaces `__WB_MANIFEST` with the precache list, and the home page joins it, so an offline
// Navigation to any route is answered by the app shell
declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: PrecacheEntry[] };

cleanupOutdatedCaches();
// oxlint-disable-next-line no-underscore-dangle -- the build injects this name, and workbox reads it by it
precacheAndRoute([...self.__WB_MANIFEST, { revision: null, url: "/" }]);
registerRoute(new NavigationRoute(createHandlerBoundToURL("/")));

// The update prompt in the tab asks a waiting worker to take over, and the reload follows the new worker taking control
self.addEventListener(
  "message",
  getSynchronizedFunction(async (event: ExtendableMessageEvent) => {
    if (event.data?.type === "SKIP_WAITING") await self.skipWaiting();
  }),
);

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
