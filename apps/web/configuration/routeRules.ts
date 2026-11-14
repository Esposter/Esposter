// oxlint-disable routing/no-route-literal -- the Nuxt configuration loads before `@esposter/shared` is built
import type { NuxtConfig } from "nuxt/schema";

// Client-only pages that touch window/localStorage during setup stay out of SSR and indexing.
// Defined globally because inline defineRouteRules (experimental.inlineRouteRules) is not
// Reliably applied, leaving "window is not defined" SSR crashes.
export const routeRules: NuxtConfig["routeRules"] = {
  // A public bucket's objects are read by every page and by other sites — an image in an email, a shared link — so they
  // Are served to any origin: the app's default resource policy is same-origin, which would block them on the app's own host
  "/assets/**": {
    // The security module's static headers are `/**`'s, so this more specific rule overrides its resource policy
    headers: { "Access-Control-Allow-Origin": "*", "Cross-Origin-Resource-Policy": "cross-origin" },
  },
  "/calls/**": { robots: false, ssr: false },
  "/dungeons": { robots: false, ssr: false },
  // A WebGPU canvas with nothing to render before it runs, and three.js is client-only, so the page is built for the browser alone
  "/fluid-simulator": { robots: false, ssr: false },
  "/messages": { robots: false, ssr: false },
  "/messages/**": { robots: false, ssr: false },
  "/resource-explorer": { robots: false, ssr: false },
  "/resource-explorer/**": { robots: false, ssr: false },
};
