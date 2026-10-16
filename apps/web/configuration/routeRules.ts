// oxlint-disable routing/no-route-literal -- the Nuxt configuration loads before `@esposter/shared` is built
import type { NuxtConfig } from "nuxt/schema";

// Client-only pages that touch window/localStorage during setup stay out of SSR and indexing.
// Defined globally because inline defineRouteRules (experimental.inlineRouteRules) is not
// Reliably applied, leaving "window is not defined" SSR crashes.
export const routeRules: NuxtConfig["routeRules"] = {
  "/calls/**": { robots: false, ssr: false },
  "/dungeons": { robots: false, ssr: false },
  "/messages": { robots: false, ssr: false },
  "/messages/**": { robots: false, ssr: false },
  "/resource-explorer": { robots: false, ssr: false },
  "/resource-explorer/**": { robots: false, ssr: false },
};
