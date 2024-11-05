import type { NuxtConfig } from "nuxt/schema";

export const nitro: NuxtConfig["nitro"] = {
  esbuild: {
    options: {
      // Required for top-level await
      target: "esnext",
    },
  },
};
