import type { NuxtConfig } from "nuxt/schema";

export const imports: NuxtConfig["imports"] = {
  dirs: ["composables/**"],
  transform: {
    // https://github.com/rolldown/rolldown/issues/8172#issuecomment-3859313807
    exclude: [/\/vue-phaserjs\//],
  },
};
