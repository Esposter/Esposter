import type { KnipConfig } from "knip";

const knipConfiguration: KnipConfig = {
  exclude: ["types"],
  ignoreBinaries: ["lint", "pwsh", "typecheck"],
  ignoreExportsUsedInFile: true,
  workspaces: {
    ".": { entry: ["virrun.config.ts"], ignoreDependencies: ["@esposter/shared-node", "@lerna-lite/publish"] },
    "apps/functions": { entry: ["src/**/*.ts"] },
    "apps/infra": { entry: ["src/**/*.ts"] },
    "apps/web": {
      // A development route is registered by its path from a module under `nuxt dev` alone, so nothing imports it
      entry: ["app/App.vue", "app/components/**/*.vue", "content.config.ts", "server/development/*.ts"],
      ignore: ["public/**", "shared/generated/**"],
      ignoreDependencies: [
        "@iconify-json/.+",
        "@takumi-rs/core",
        "@vueuse/router",
        // @TODO: no upstream issue — unstorage 2's fs driver loads `chokidar` without declaring it, so the app declares
        // It for Nitro 3's server bundle and nothing in the app imports it (nitrojs/nitro)
        "chokidar",
        // @TODO: no upstream issue — `@nuxt/scripts` mounts its `nuxt-scripts-cache` storage on unstorage's lru-cache
        // Driver, which loads `lru-cache` without declaring it, so the app declares it and nothing in the app imports
        // It; without it `nuxt prepare` installs it itself and rewrites the catalog under CI's install (nuxt/scripts)
        "lru-cache",
        // @TODO: no upstream issue — `nuxt-ai-ready`'s virtual `content-lookup` module imports `minimark/stringify` without
        // Declaring it, so the app declares it and nothing in the app imports it (harlan-zw/nuxt-ai-ready)
        "minimark",
        // @TODO: no upstream issue — `@nuxt/nitro-server` aliases `bufferutil` to `mocked-exports/proxy`, which Nitro 3
        // Resolves from the app, so nothing in the app imports it (nuxt/nuxt)
        "mocked-exports",
        // @TODO: https://github.com/nuxt/nuxt/releases/tag/v5.0.0 — knip reads an `#app` import as the package it
        // Resolves to, which is the `nuxt-nightly` alias until the catalog's `nuxt` is a range again
        "nuxt-nightly",
        // @TODO: no upstream issue — `@nuxtjs/mdc`'s generated plugin imports reach `remark-emoji`, which Nitro 3
        // Resolves from the app, so nothing in the app imports it (nuxt-content/mdc)
        "remark-emoji",
        // Nuxt loads it by name when `nuxt analyze` turns `build.analyze` on, for the dependency score's bundle column, so
        // Nothing in the app imports it
        "rollup-plugin-visualizer",
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
      entry: ["parity/*.visual.ts", "src/index.ts", "src/**/*.reference.ts", "src/workers/*.ts"],
      ignore: ["**/auto-imports.d.ts"],
    },
    // A type bench is run by `pnpm bench:types` and imported by nothing, as its fixture is imported by the benches alone
    "packages/shared": { entry: ["src/index.ts", "src/**/*.typebench.ts"] },
    // The benchmark reporter imports vitest's types alone, so a consumer that never benches needs no vitest: the peer is
    // Optional on purpose
    "packages/shared-node": { ignoreDependencies: ["vitest"] },
    "packages/trpc-nuxt-module": { entry: ["test/fixture/nuxt.config.ts"] },
    scripts: {
      // The shell wrapper starts the slot gate by its path, so nothing imports it
      entry: ["src/oxlint/**/*.ts"],
      // Loaded by path through createRequire, which knip cannot follow
      ignoreDependencies: ["@wasm-audio-decoders/ogg-vorbis", "jscpd"],
    },
  },
};

export default knipConfiguration;
