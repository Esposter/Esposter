import type { NuxtConfig } from "nuxt/schema";

export const vite: NuxtConfig["vite"] = {
  // A glTF model is imported for its URL like an image, which Vite knows as an asset only by this
  assetsInclude: ["**/*.gltf"],
  build: {
    // Fix phaser "Local data URIs are not supported"
    // https://www.andrewzigler.com/blog/using-phaser-3-with-nuxt
    assetsInlineLimit: 0,
  },
  environments: {
    // @TODO: no upstream issue — unjs/env-runner: the dev server runs Nitro in Miniflare, whose module fallback serves a
    // `require`d `.json` file as CommonJS source, so juice's `require("./package.json")` under mjml throws "Unexpected
    // Token ':'" and every page answers 500. mjml is pre-bundled into ESM for the Nitro environment, and kept off the
    // Externals so that bundle is the one loaded
    nitro: { optimizeDeps: { include: ["mjml"] }, resolve: { noExternal: ["mjml"] } },
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

// Nuxt resolves a client chunk's imported asset against the chunk (`new URL(file, import.meta.url)`, an absolute URL
// Once read) where the server render writes it through `__buildAssetsURL`, root-relative: every server-rendered
// `<img>` of an imported asset then hydrated as a mismatch. The client resolves its assets through the same helper
export const viteHooks: NuxtConfig["hooks"] = {
  "vite:extend": ({ config, nuxt }) => {
    const renderBuiltUrl = config.experimental?.renderBuiltUrl;
    if (!renderBuiltUrl) return;
    const buildAssetsDirectory = `${nuxt.options.app.buildAssetsDir.replaceAll(/^\/|\/$/gu, "")}/`;
    config.experimental = {
      ...config.experimental,
      renderBuiltUrl: (filename, context) =>
        !context.ssr && context.hostType === "js" && context.type === "asset"
          ? { runtime: `globalThis.__buildAssetsURL(${JSON.stringify(filename.replace(buildAssetsDirectory, ""))})` }
          : renderBuiltUrl(filename, context),
    };
  },
};
