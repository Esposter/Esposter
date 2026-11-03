// @TODO: https://github.com/vite-pwa/unplugin-pwa/issues/48 — drop this plugin once the engine resolves its own dependency
import type { Plugin } from "vite";

import { MODULE_NAME } from "#src/runtime/constants";
import { fileURLToPath } from "node:url";

const WORKBOX_WINDOW_SPECIFIERS: ReadonlySet<string> = new Set([
  "@vite-pwa/workbox-window",
  "@vite-pwa/workbox-window/esm-sw-detector",
]);

// The engine's register code is a virtual module, which Vite resolves from the app's root, and a package manager that
// Hoists nothing leaves the app without the engine's own dependency. The module depends on it too, so it is resolved here
export const createWorkboxWindowPlugin = (): Plugin => ({
  enforce: "pre",
  name: `${MODULE_NAME}:workbox-window`,
  resolveId(id) {
    if (WORKBOX_WINDOW_SPECIFIERS.has(id)) return fileURLToPath(import.meta.resolve(id));
    return undefined;
  },
});
