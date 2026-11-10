import type { NuxtConfig } from "nuxt/schema";

export const vite: NuxtConfig["vite"] = {
  build: {
    // Fix phaser "Local data URIs are not supported"
    // https://www.andrewzigler.com/blog/using-phaser-3-with-nuxt
    assetsInlineLimit: 0,
  },
  mode: process.env.APP_ENV,
  optimizeDeps: {
    exclude: [
      // Three's inspector loads extension assets relative to import.meta.url, which breaks from Vite's cache.
      "three/examples/jsm/inspector/Inspector.js",
    ],
    // JSON Forms' Ajv is CommonJS and the schema forms only load in a dialog, so it is named through its importer, whose
    // Own copy it is
    include: ["@jsonforms/core > ajv", "@jsonforms/core > ajv-formats"],
  },
};
