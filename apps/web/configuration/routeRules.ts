// oxlint-disable routing/no-route-literal -- the Nuxt configuration loads before `@esposter/shared` is built
import type { NuxtConfig } from "nuxt/schema";

export const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable";
// A file of the build folder, which carries the robots header and the lifetime its rule gives it. The embedder policy
// Is the page's own: a dedicated worker's script is refused unless its response carries it, and the Worker's assets
// Binding serves these files without its request hook, so the policy is a header rule here
const buildFileRule = (cacheControl: string) => ({
  headers: {
    "cache-control": cacheControl,
    "Cross-Origin-Embedder-Policy": "credentialless",
    "X-Robots-Tag": "noindex",
  },
});

// Client-only pages that touch window/localStorage during setup stay out of SSR and indexing.
// Defined globally because inline defineRouteRules (experimental.inlineRouteRules) is not
// Reliably applied, leaving "window is not defined" SSR crashes.
export const routeRules: NonNullable<NuxtConfig["routeRules"]> = {
  // Nitro stamps the build folder `/**` immutable, and Cloudflare joins every `_headers` rule a path matches, so the
  // Build list would carry that year beside its own lifetime. The folder's rules name its files instead: a placeholder
  // Matches one path segment, so `builds/:file` is the list alone and the hashed files are the rules beside it
  "/_nuxt/:file": buildFileRule(IMMUTABLE_CACHE_CONTROL),
  "/_nuxt/**": { headers: false },
  "/_nuxt/builds/:file": buildFileRule("public, max-age=0, must-revalidate"),
  "/_nuxt/builds/**": { headers: false },
  "/_nuxt/builds/meta/**": buildFileRule(IMMUTABLE_CACHE_CONTROL),
  "/_nuxt/engine/**": buildFileRule(IMMUTABLE_CACHE_CONTROL),
  "/_nuxt/fonts/**": buildFileRule(IMMUTABLE_CACHE_CONTROL),
  // A public bucket's objects are read by every page and by other sites — an image in an email, a shared link — so they
  // Are served to any origin: the app's default resource policy is same-origin, which would block them on the app's own
  // Host
  "/assets/**": {
    // The security module's static headers are `/**`'s, so this more specific rule overrides its resource policy
    headers: { "Access-Control-Allow-Origin": "*", "Cross-Origin-Resource-Policy": "cross-origin" },
  },
  "/calls/**": { robots: false, ssr: false },
  // The page imports `phaser` (`pages/dungeons.vue`), and phaser's module evaluation reads `window`: its device
  // Detection runs in `init()` and reads `window.cordova`, so under Node SSR the import throws `window is not defined`
  // And the page stays client-only
  "/dungeons": { robots: false, ssr: false },
  // A WebGPU canvas with nothing to render before it runs, and three.js is client-only, so the page is built for the
  // Browser alone
  "/fluid-simulator": { robots: false, ssr: false },
  "/messages": { robots: false, ssr: false },
  "/messages/**": { robots: false, ssr: false },
  "/resource-explorer": { robots: false, ssr: false },
  "/resource-explorer/**": { robots: false, ssr: false },
  // @TODO: https://github.com/h3js/h3/pull/1629 — h3 2.0.8 rebuilds a handler's answer to merge the headers Nitro's
  // Headers rule writes after it, and a socket's upgrade is a 101 carrying the socket, which the rebuild drops and
  // Workers refuses to construct. `false` removes the security module's `/**` headers on the sockets' routes until h3
  // Releases the fix that leaves a 101 as it is
  "/ws/**": { headers: false },
};
