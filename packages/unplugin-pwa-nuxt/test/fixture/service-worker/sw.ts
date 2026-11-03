import { createHandlerBoundToURL, precacheAndRoute } from "@vite-pwa/workbox-swkit/precaching";
import { NavigationRoute, registerRoute } from "@vite-pwa/workbox-swkit/routing";
import { navigationDenylist } from "virtual:unplugin-pwa-nuxt/navigation-denylist";

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: { revision: null | string; url: string }[] };

// oxlint-disable-next-line no-underscore-dangle -- the build injects this name, and workbox reads it by it
precacheAndRoute([...self.__WB_MANIFEST, { revision: null, url: "/" }]);
registerRoute(new NavigationRoute(createHandlerBoundToURL("/"), { denylist: navigationDenylist }));
