import { resolve } from "node:path";

// The smallest Nuxt app the module builds: one page, one server route and a service worker written in TypeScript
export default defineNuxtConfig({
  compatibilityDate: "2026-11-01",
  modules: [resolve(import.meta.dirname, "../../src/module.ts")],
  pwa: {
    buildSW: { swSrc: resolve(import.meta.dirname, "service-worker/sw.ts") },
    filename: "sw.js",
    manifest: { name: "Fixture", short_name: "Fixture", theme_color: "#112233" },
    strategies: "buildSW",
  },
});
