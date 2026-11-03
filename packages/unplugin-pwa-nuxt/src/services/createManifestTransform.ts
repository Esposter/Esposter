import type { ManifestTransform } from "@vite-pwa/workbox-build/types";

const HTML_SUFFIX_REGEX = /(?:^|\/)index\.html$|\.html$/u;

/**
 * Nuxt serves a prerendered page at its route, not at its file, so a precached `about/index.html` or `about.html` is
 * keyed as `about` and the entry for the app's own `index.html` as the base URL. A build's app manifest is named by its
 * content, so its revision is the name and workbox never re-downloads one it already holds.
 */
export const createManifestTransform =
  (baseURL: string, buildAssetsDirectory: string): ManifestTransform =>
  (entries) => ({
    manifest: entries.map((entry) => {
      if (entry.url.endsWith(".html")) {
        const route = entry.url.replace(HTML_SUFFIX_REGEX, "");
        return { ...entry, url: route === "" ? baseURL : route };
      }
      if (entry.url.startsWith(`${buildAssetsDirectory}builds/meta/`)) return { ...entry, revision: null };
      return entry;
    }),
    warnings: [],
  });
