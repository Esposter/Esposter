import type { KnipConfig } from "knip";

const knipConfiguration: KnipConfig = {
  exclude: ["types"],
  ignoreBinaries: ["pwsh", "reg", "tasklist", "tsdown"],
  ignoreExportsUsedInFile: true,
  workspaces: {
    ".": { entry: ["virrun.config.ts"], ignoreDependencies: ["@esposter/shared-node", "@lerna-lite/publish"] },
    "apps/functions": { entry: ["src/**/*.ts"] },
    "apps/infra": { entry: ["src/**/*.ts"] },
    "apps/web": {
      entry: ["app/App.vue", "app/components/**/*.vue", "content.config.ts"],
      ignore: ["public/**", "shared/generated/**"],
      ignoreDependencies: [
        "@iconify-json/.+",
        "@takumi-rs/core",
        "@vueuse/router",
        // @TODO: no upstream issue — unstorage 2's fs driver loads `chokidar` without declaring it, so the app declares
        // It for Nitro 3's server bundle and nothing in the app imports it (nitrojs/nitro)
        "chokidar",
        // @TODO: no upstream issue — nuxt-security mounts its rate limiter's storage with `rateLimiter: false`, whose
        // Driver loads `lru-cache` from the app, so nothing in the app imports it (Baroshem/nuxt-security)
        "lru-cache",
        // @TODO: no upstream issue — `@nuxt/nitro-server` aliases `bufferutil` to `mocked-exports/proxy`, which Nitro 3
        // Resolves from the app, so nothing in the app imports it (nuxt/nuxt)
        "mocked-exports",
        // @TODO: https://github.com/nuxt/nuxt/releases/tag/v5.0.0 — knip reads an `#app` import as the package it
        // Resolves to, which is the `nuxt-nightly` alias until the catalog's `nuxt` is a range again
        "nuxt-nightly",
        // @TODO: no upstream issue — `@nuxtjs/mdc`'s generated plugin imports reach `remark-emoji`, which Nitro 3
        // Resolves from the app, so nothing in the app imports it (nuxt-content/mdc)
        "remark-emoji",
        "temporal-polyfill",
        "vue-tsc",
      ],
    },
    "packages/follow-ups": { entry: ["scripts/**/*.ts"] },
    "packages/genshin-interface": {
      entry: ["src/index.ts", "src/**/*.reference.ts", "src/**/*.visual.ts"],
      ignore: ["**/auto-imports.d.ts"],
    },
    "packages/genshin-mods": { entry: ["src/register.ts"], ignoreDependencies: ["claude-code"] },
    "packages/genshin-persona": {
      entry: [
        "mod/register.ts",
        "scripts/*.mjs",
        "scripts/**/*.ts",
        "src/localizations/*.ts",
        "src/personaCards/**/*.ts",
        "src/services/**/*.ts",
      ],
      ignore: ["src/generated/**"],
      ignoreDependencies: ["claude-code"],
    },
    "packages/genshin-world": {
      entry: ["parity/main.ts", "parity/*.visual.ts", "src/index.ts", "src/**/*.reference.ts", "src/workers/*.ts"],
      ignore: ["**/auto-imports.d.ts"],
    },
    "packages/trpc-nuxt-module": { entry: ["test/fixture/nuxt.config.ts"] },
    scripts: { entry: ["src/oxlint/**/*.ts"], ignoreDependencies: ["@wasm-audio-decoders/ogg-vorbis"] },
  },
};

export default knipConfiguration;
