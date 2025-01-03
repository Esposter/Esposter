import type { NuxtConfig } from "nuxt/schema";

export const nitro: NuxtConfig["nitro"] = {
  esbuild: {
    options: {
      supported: {
        // This is used by drizzle migrations
        "top-level-await": true,
      },
    },
  },
};
