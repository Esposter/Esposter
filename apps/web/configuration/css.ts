import type { NuxtConfig } from "nuxt/schema";

// The Genshin packages' screens and the interface pieces they are made of carry their own scoped styles, each
// Package's bundled into one small sheet
export const css: NuxtConfig["css"] = [
  "@/assets/css/layers.css",
  "@/assets/css/globals.scss",
  "genshin-interface/style.css",
  "genshin-world/style.css",
];
