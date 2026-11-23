// The navigation denylist is a virtual module of the PWA module, typed by the types it ships
/// <reference types="unplugin-pwa-nuxt/navigation-denylist" />
import type { PushNotificationPayload } from "@esposter/db-schema";
import type { PrecacheEntry } from "@vite-pwa/workbox-swkit/precaching";

import { HostedAssetOriginMap } from "@esposter/db-schema";
import { omitUndefined } from "@esposter/shared";
import { cacheNames } from "@vite-pwa/workbox-swkit/core";
import { ExpirationPlugin } from "@vite-pwa/workbox-swkit/expiration";
import { cleanupOutdatedCaches, precacheAndRoute } from "@vite-pwa/workbox-swkit/precaching";
import { NavigationRoute, registerRoute } from "@vite-pwa/workbox-swkit/routing";
import { NetworkFirst } from "@vite-pwa/workbox-swkit/strategies";
import { HOSTED_ASSETS_CACHE_NAME } from "hosted-assets";
import { navigationDenylist } from "virtual:unplugin-pwa-nuxt/navigation-denylist";

// The build replaces `__WB_MANIFEST` with the precache list of the build's own files, each named by its content or
// Carrying its revision. A page is server-rendered, so it comes from the network first and is kept for the moments
// There is none: a page precached once, with no revision, would point at the files of the build it was cached from for as
// Long as the worker lives. A route the server answers itself, such as an API route or a file it serves, is not a
// Page, so the module hands over its routes as the denylist
declare let self: { __WB_MANIFEST: PrecacheEntry[] } & ServiceWorkerGlobalScope;

const MAX_CACHED_PAGES = 32;
const NETWORK_TIMEOUT_SECONDS = 3;
const PAGES_CACHE_NAME = "pages";
// The caches this worker owns: its precache, the pages it keeps, and the hosted objects its preloader fills. Activation deletes
// Every other cache of the origin, so a cache an earlier build or an earlier product left under another name is not kept
const OWNED_CACHE_NAMES: ReadonlySet<string> = new Set([
  cacheNames.precache,
  HOSTED_ASSETS_CACHE_NAME,
  PAGES_CACHE_NAME,
]);

cleanupOutdatedCaches();
// oxlint-disable-next-line no-underscore-dangle -- the build injects this name, and workbox reads it by it
precacheAndRoute(self.__WB_MANIFEST);
// @TODO: https://github.com/GoogleChrome/workbox/issues/3490 — a plugin class declares each hook it implements as
// `WorkboxPlugin[hook]`, which carries `undefined` that the interface's optional hook refuses under
// `exactOptionalPropertyTypes`. Both hooks are arrow-function fields, so they keep their instance without it
const { cacheDidUpdate, cachedResponseWillBeUsed } = new ExpirationPlugin({ maxEntries: MAX_CACHED_PAGES });
const expirationPlugin = omitUndefined({ cacheDidUpdate, cachedResponseWillBeUsed });
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: PAGES_CACHE_NAME,
      networkTimeoutSeconds: NETWORK_TIMEOUT_SECONDS,
      plugins: [expirationPlugin],
    }),
    { denylist: navigationDenylist },
  ),
);

// A hosted object is answered from the cache its preloader filled, and a miss goes to the network unstored, since the
// Preloader alone decides what the cache holds. The url embeds the object's hash, so a cached answer is never stale
const HOSTED_ORIGINS: readonly string[] = Object.values(HostedAssetOriginMap);
registerRoute(
  ({ url }) => HOSTED_ORIGINS.includes(url.origin),
  async ({ request }) => {
    const cache = await caches.open(HOSTED_ASSETS_CACHE_NAME);
    return (await cache.match(request)) ?? fetch(request);
  },
);

// The update prompt in the tab asks a waiting worker to take over, and the reload follows the new worker taking control
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") event.waitUntil(self.skipWaiting());
});

// A worker takes the open pages at activation, so the page that installed it is controlled without a second navigation,
// And its hosted requests reach the cache. It deletes the caches it does not own first, so the one an earlier build kept
// Under a name this worker no longer uses is not kept for good
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => !OWNED_CACHE_NAMES.has(name)).map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
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
      await self.registration.showNotification(title ?? "", { body, data, ...(icon ? { icon } : {}) });
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
