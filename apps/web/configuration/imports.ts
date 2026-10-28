import type { NuxtConfig } from "nuxt/schema";

export const imports: NuxtConfig["imports"] = {
  dirs: ["composables/**"],
  transform: {
    // @TODO: https://github.com/nuxt/nuxt/issues/19525 — drop the exclude once Nuxt skips linked libraries
    exclude: [/\/vue-phaserjs\//u],
  },
};
