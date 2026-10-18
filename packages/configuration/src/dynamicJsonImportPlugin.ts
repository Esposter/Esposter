import type { Plugin } from "vite";

import { removeDynamicJsonImportAttributes } from "#src/removeDynamicJsonImportAttributes";

// @TODO: https://github.com/vitejs/vite/issues/19095
// Vite's server hands a JSON file on as a JavaScript module and strips a static import's `type: "json"` to match, but
// Leaves a dynamic import's, so the browser refuses the module for its type: every language of the game's text but
// English, which `genshin-text` imports dynamically. A build bundles each into its own chunk and needs none of this
export const dynamicJsonImportPlugin: Plugin = {
  apply: "serve",
  name: "dynamic-json-import",
  transform: { filter: { code: 'type: "json"' }, handler: removeDynamicJsonImportAttributes },
};
