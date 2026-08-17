import type { NitroConfig } from "nitropack/types";
// Client-only pages (no SSR/SEO benefit) that touch window/localStorage during setup.
// Defined globally because inline defineRouteRules (experimental.inlineRouteRules) is not
// Reliably applied, leaving "window is not defined" SSR crashes.
export const routeRules: NitroConfig["routeRules"] = {
  "/calls/**": { ssr: false },
  "/dungeons": { ssr: false },
  "/messages": { ssr: false },
  "/messages/**": { ssr: false },
  "/resource-explorer": { ssr: false },
  "/resource-explorer/**": { ssr: false },
};
