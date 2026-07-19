import type { NuxtConfig } from "nuxt/schema";

export const typescript: NuxtConfig["typescript"] = {
  tsConfig: {
    // Giant generated tileset modules hang type-aware tooling, so keep them out of typecheck
    exclude: ["../public/tilesets/**/*.tsx"],
  },
};
