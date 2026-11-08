import type { NuxtConfig } from "nuxt/schema";

// The Genshin packages' screens and the interface pieces they are made of import their own scoped styles, so a
// Page loads the sheets of the components it reaches
export const css: NuxtConfig["css"] = ["@/assets/css/layers.css", "@/assets/css/globals.css"];
