import type { NuxtConfig } from "nuxt/schema";

// The Genshin packages' screens and the interface pieces they are made of carry their own scoped styles, each
// Package's bundled into one small sheet. Nuxt resolves an entry from its own package, where the app's `imports` do not
// Reach, so the app's sheets are named through Nuxt's alias for its source
export const css: NonNullable<NuxtConfig["css"]> = [
  "@/assets/css/layers.css",
  "@/assets/css/globals.css",
  "genshin-interface/style.css",
  "genshin-world/style.css",
];
