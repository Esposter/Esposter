import type { ManifestTransform } from "@vite-pwa/workbox-build/types";

const HTML_SUFFIX_REGEX = /(?:^|\/)index\.html$|\.html$/u;

/**
 * Nuxt serves a prerendered page at its route, not at its file, so a precached `about/index.html` or `about.html` is
 * keyed as `about` and the entry for the app's own `index.html` as the base URL.
 */
export const createManifestTransform =
  (baseURL: string): ManifestTransform =>
  (entries) => ({
    manifest: entries.map((entry) => {
      if (entry.url.endsWith(".html")) {
        const route = entry.url.replace(HTML_SUFFIX_REGEX, "");
        return { ...entry, url: route || baseURL };
      }
      return entry;
    }),
    warnings: [],
  });
