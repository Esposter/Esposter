import { resolve } from "node:path";

// The smallest Nuxt app the module builds: one page, one server route, a service worker written in TypeScript and a
// Manifest icon, which the engine reads from the app's public folder
export default defineNuxtConfig({
  compatibilityDate: "2026-11-01",
  modules: [resolve(import.meta.dirname, "../../src/module.ts")],
  pwa: {
    buildSW: { swSrc: resolve(import.meta.dirname, "service-worker/sw.ts") },
    filename: "sw.js",
    manifest: {
      icons: [{ sizes: "192x192", src: "/icon.png", type: "image/png" }],
      name: "Fixture",
      short_name: "Fixture",
      theme_color: "#112233",
    },
    strategies: "buildSW",
  },
});
