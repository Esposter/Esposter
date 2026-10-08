import type { Plugin } from "vite";

// @TODO: https://github.com/vitejs/vite/issues/19095
// Vite's server hands a JSON file on as a JavaScript module and strips a static import's `type: "json"` to match, but
// Leaves a dynamic import's, so the browser refuses the module for its type: every language of the game's text but
// English, which `genshin-text` imports dynamically. A build bundles each into a chunk of its own and needs none of this
export const dynamicJsonImportPlugin: Plugin = {
  apply: "serve",
  name: "dynamic-json-import",
  transform: {
    filter: { code: 'type: "json"' },
    handler: (code) =>
      code.replaceAll(
        /(?<specifier>import\(\s*["'][^"']+\.json["'])\s*,\s*\{\s*with:\s*\{\s*type:\s*"json"\s*\}\s*\}\s*\)/gu,
        "$1)",
      ),
  },
};
