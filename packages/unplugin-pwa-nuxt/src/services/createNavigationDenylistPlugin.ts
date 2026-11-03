import type { Plugin } from "vite";

import { NAVIGATION_DENYLIST_MODULE } from "#src/runtime/constants";

const RESOLVED_NAVIGATION_DENYLIST_MODULE = `\0${NAVIGATION_DENYLIST_MODULE}`;

// Read when the worker is built, after Nitro has its routes, so the module is the server's routes as they stand then
export const createNavigationDenylistPlugin = (getNavigationDenylist: () => readonly RegExp[]): Plugin => ({
  load(id) {
    if (id === RESOLVED_NAVIGATION_DENYLIST_MODULE)
      return `export const navigationDenylist = [${getNavigationDenylist().join(",")}];`;
    return undefined;
  },
  name: "unplugin-pwa-nuxt:navigation-denylist",
  resolveId(id) {
    if (id === NAVIGATION_DENYLIST_MODULE) return RESOLVED_NAVIGATION_DENYLIST_MODULE;
    return undefined;
  },
});
