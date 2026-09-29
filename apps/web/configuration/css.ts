import type { NuxtConfig } from "nuxt/schema";

// The Genshin world package's screens carry their own scoped styles, bundled into one small sheet
export const css: NuxtConfig["css"] = [
  "@/assets/css/layers.css",
  "@/assets/css/globals.scss",
  "genshin-world/style.css",
];
