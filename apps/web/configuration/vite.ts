import type { NuxtConfig } from "nuxt/schema";

import { createRequire } from "node:module";
import { dirname, join } from "node:path";

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
    // JSON Forms' Ajv is CommonJS the schema forms only load in a dialog, so it is named through its importer, whose own
    // Copy it is
    include: [
      "@jsonforms/core > ajv",
      "@jsonforms/core > ajv-formats",
      "pdfjs-dist",
      // The PDF viewer's components, which a dialog loads mid-session
      "pdfjs-dist/web/pdf_viewer.mjs",
      // The world's and the login's imports, which Vite finds only as their components mount. Left out, each is found
      // Mid-session and the optimiser re-runs, so the chunks the loaded modules name answer 504 until a reload
      "@better-auth/api-key/client",
      "@livekit/track-processors",
      "@trpc/client",
      "@trpc/server",
      "@trpc/server/observable",
      "@vue-flow/core",
      "better-auth/client/plugins",
      "better-auth/vue",
      "drizzle-orm",
      "drizzle-orm/pg-core",
      "drizzle-orm/zod",
      "fflate",
      "livekit-client",
      "minisearch",
      "@esposter/shared > neverthrow",
      "node-html-parser",
      "@esposter/shared > parse5",
      "superjson",
      "survey-core/survey.i18n",
      "survey-core/themes",
      "survey-creator-core",
      "survey-creator-core/survey-creator-core.i18n",
      "survey-vue3-ui",
      "genshin-engine > three-mesh-bvh",
      "three/examples/jsm/csm/CSMShadowNode.js",
      "three/examples/jsm/loaders/OBJLoader.js",
      "three/examples/jsm/math/Capsule.js",
      "three/examples/jsm/math/Octree.js",
      "three/examples/jsm/tsl/display/BilateralBlurNode.js",
      "three/examples/jsm/tsl/display/BloomNode.js",
      "three/examples/jsm/tsl/display/depthAwareBlend.js",
      "three/examples/jsm/tsl/display/GodraysNode.js",
      "three/examples/jsm/tsl/display/GTAONode.js",
      "three/examples/jsm/tsl/display/Lut3DNode.js",
      "three/examples/jsm/tsl/display/SMAANode.js",
      "three/examples/jsm/tsl/display/TRAANode.js",
      "three/examples/jsm/tsl/math/voronoiNoise.js",
      "three/examples/jsm/utils/BufferGeometryUtils.js",
      "three/tsl",
      "three/webgpu",
      "zod",
    ],
  },
  // Yaml's Node export is CommonJS, which the ESM Vite SSR runner cannot evaluate; use its equivalent ESM build.
  plugins: [
    {
      enforce: "pre",
      name: "yaml-browser-ssr-entry",
      resolveId(source, importer) {
        if (source !== "yaml" || !importer) return null;
        const yamlDirectory = dirname(createRequire(importer).resolve("yaml/package.json"));
        return join(yamlDirectory, "browser/index.js");
      },
    },
  ],
};
