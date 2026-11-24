import type { NuxtConfig } from "nuxt/schema";

import { ENGINE_ASSETS_DIRECTORY } from "#configuration/constants";

// The call backgrounds' folder, whose files stay urls: the call rasterises only a `.svg` url, and the picker names one
// Unquoted inside `url()`, which an inlined data url's quotes break
const CALL_BACKGROUNDS_REGEX = /(?:^|[/\\])message[/\\]room[/\\]call[/\\]backgrounds[/\\]/u;

export const vite: NonNullable<NuxtConfig["vite"]> = {
  // A glTF model is imported for its URL like an image, which Vite knows as an asset only by this
  assetsInclude: ["**/*.gltf"],
  build: {
    // Every other small asset is inlined as a data url. The consumers that take one are an image's `src`, a quoted CSS
    // `url()` and the clicker's icons, while no font or sound is under the limit, which the policy would refuse as data
    assetsInlineLimit: (filePath) => (CALL_BACKGROUNDS_REGEX.test(filePath) ? false : undefined),
    rolldownOptions: {
      // A module both lazily and statically imported stays in its static importer's chunk, so the lazy import splits
      // Nothing off: the build fails on it, as the enforcement ladder's build rung
      onLog: (level, log, handler) => {
        handler(log.code === "INEFFECTIVE_DYNAMIC_IMPORT" ? "error" : level, log);
      },
    },
  },
  environments: {
    // @TODO: https://github.com/unjs/env-runner/issues/110 — the dev server runs Nitro in Miniflare, whose module
    // Fallback serves a `require`d `.json` file as CommonJS source, so juice's `require("./package.json")` under mjml
    // Throws "Unexpected token ':'" and every page answers 500. mjml is pre-bundled into ESM for the Nitro environment,
    // And kept off the externals so that bundle is the one loaded
    nitro: { optimizeDeps: { include: ["mjml"] }, resolve: { noExternal: ["mjml"] } },
  },
  ...(process.env.APP_ENV === undefined ? {} : { mode: process.env.APP_ENV }),
  optimizeDeps: {
    exclude: [
      // Three's inspector loads extension assets relative to import.meta.url, which breaks from Vite's cache.
      "three/examples/jsm/inspector/Inspector.js",
    ],
    // JSON Forms' Ajv is CommonJS and the schema forms only load in a dialog, so it is named through its importer,
    // Whose own copy it is
    include: ["@jsonforms/core > ajv", "@jsonforms/core > ajv-formats"],
  },
};

// The app assets a game or 3D engine loads by URL at runtime: Phaser's dungeons and the three.js scenes' textures
const ENGINE_ASSET_REGEX = /(?:^|[/\\])assets[/\\](?:dungeons|visual)[/\\]/u;

// Nuxt resolves a client chunk's imported asset against the chunk (`new URL(file, import.meta.url)`, an absolute URL
// Once read) where the server render writes it through `__buildAssetsURL`, root-relative: every server-rendered
// `<img>` of an imported asset then hydrated as a mismatch. The client resolves its assets through the same helper
export const viteHooks: NuxtConfig["hooks"] = {
  "vite:extend": ({ config, nuxt }) => {
    const buildAssetsDirectory = `${nuxt.options.app.buildAssetsDir.replaceAll(/^\/|\/$/gu, "")}/`;
    // The service worker's precache leaves the engine folder out, so an engine's file is named under it. A dev build
    // Names its assets by Vite's own rule and has no `assetFileNames` function here, so it is left as it is
    const output = config.build?.rolldownOptions?.output;
    if (output && !Array.isArray(output) && typeof output.assetFileNames === "function") {
      const assetFileNames = output.assetFileNames;
      output.assetFileNames = (asset) => {
        const fileName = assetFileNames(asset);
        return asset.originalFileNames.some((path) => ENGINE_ASSET_REGEX.test(path))
          ? fileName.replace(buildAssetsDirectory, `${buildAssetsDirectory}${ENGINE_ASSETS_DIRECTORY}/`)
          : fileName;
      };
    }
    const renderBuiltUrl = config.experimental?.renderBuiltUrl;
    if (!renderBuiltUrl) return;
    config.experimental = {
      ...config.experimental,
      renderBuiltUrl: (filename, context) =>
        !context.ssr && context.hostType === "js" && context.type === "asset"
          ? { runtime: `globalThis.__buildAssetsURL(${JSON.stringify(filename.replace(buildAssetsDirectory, ""))})` }
          : renderBuiltUrl(filename, context),
    };
  },
};
