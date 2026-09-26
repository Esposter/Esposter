import type { NitroConfig } from "nitropack/types";

// Client-only pages (no SSR/SEO benefit) that touch window/localStorage during setup.
// Defined globally because inline defineRouteRules (experimental.inlineRouteRules) is not
// Reliably applied, leaving "window is not defined" SSR crashes.
export const routeRules: NitroConfig["routeRules"] = {
  // Nuxt-security sends its embedder policy on rendered pages alone, and a page with one can only start a dedicated
  // Worker whose script sends one too, so the built scripts carry the page's production policy
  "/_nuxt/**": { headers: { "Cross-Origin-Embedder-Policy": "credentialless" } },
  "/calls/**": { ssr: false },
  "/dungeons": { ssr: false },
  "/messages": { ssr: false },
  "/messages/**": { ssr: false },
  "/resource-explorer": { ssr: false },
  "/resource-explorer/**": { ssr: false },
};
