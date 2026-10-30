import type { KnipConfig } from "knip";

const knipConfiguration: KnipConfig = {
  exclude: ["types"],
  // `typecheck:workspace` in `vite.config.ts` names `typecheck` as the first word of its command, which knip reads as a binary
  ignoreBinaries: ["pwsh", "typecheck"],
  ignoreExportsUsedInFile: true,
  // A workspace's `entry` replaces knip's default `src/index.ts`, so a package that sets one lists its barrel too
  workspaces: {
    ".": {
      // The `lint:workflows` task in `vite.config.ts` runs this package's binary, which no script names
      // The OpenSpec skill invokes this CLI with `pnpm exec`, which Knip does not trace from skill prose
      ignoreDependencies: [
        "@esposter/shared-node",
        "@fission-ai/openspec",
        "@kjanat/actionlint",
        "@lerna-lite/publish",
      ],
    },
    "apps/functions": { entry: ["src/**/*.ts"] },
    "apps/infra": { entry: ["src/**/*.ts"] },
    "apps/web": {
      // A development route is registered by its path from a module under `nuxt dev` alone, so nothing imports it
      // `scripts/*/index.ts` is launched by path through `vpx` in `apps/web/package.json`, and `service-worker/sw.ts` by the
      // PWA module from `srcDir`, which knip does not follow
      entry: [
        "app/App.vue",
        "app/components/**/*.vue",
        "scripts/*/index.ts",
        "server/development/*.ts",
        "service-worker/sw.ts",
      ],
      ignore: ["public/**", "shared/generated/**"],
      ignoreDependencies: [
        "@iconify-json/.+",
        "@takumi-rs/core",
        // `tresjs-nuxt` registers the components of every `@tresjs` package the app declares, so the templates name
        // Cientos's components and nothing imports the package
        "@tresjs/cientos",
        "@vueuse/router",
        // @TODO: no upstream issue — unstorage 2's fs driver loads `chokidar` without declaring it, so the app declares
        // It for Nitro 3's server bundle and nothing in the app imports it (nitrojs/nitro)
        "chokidar",
        // @TODO: no upstream issue — `@nuxt/scripts` mounts its `nuxt-scripts-cache` storage on unstorage's lru-cache
        // Driver, which loads `lru-cache` without declaring it, so the app declares it and nothing in the app imports
        // It; without it `nuxt prepare` installs it itself and rewrites the catalog under CI's install (nuxt/scripts)
        "lru-cache",
        // @TODO: no upstream issue — Nitro 3 resolves `@nuxt/nitro-server`'s `mocked-exports/proxy` alias from the app
        // Remove this ignore entry when Nitro resolves the alias from Nuxt (nuxt/nuxt)
        "mocked-exports",
        // @TODO: https://github.com/nuxt/nuxt/releases/tag/v5.0.0 — knip reads an `#app` import as the package it
        // Resolves to, which is the `nuxt-nightly` alias until the catalog's `nuxt` is a range again
        "nuxt-nightly",
        // Nuxt loads it by name when `nuxt analyze` turns `build.analyze` on, for the dependency score's bundle column, so
        // Nothing in the app imports it
        "rollup-plugin-visualizer",
        "temporal-polyfill",
        // @TODO: no upstream issue — Nitro 3 resolves unstorage from the app for the `kv` mounts Nuxt's storage options
        // Become, so the app declares it and nothing in the app imports it (nuxt/nuxt)
        "unstorage",
        "vue-tsc",
      ],
    },
    "packages/db-mock": { entry: ["scripts/**/*.ts", "src/index.ts"] },
    "packages/follow-ups": { entry: ["scripts/**/*.ts"] },
    "packages/genshin-interface": {
      entry: ["src/index.ts", "src/**/*.reference.ts", "src/**/*.visual.ts"],
      ignore: ["**/auto-imports.d.ts"],
      // The declaration build hands `.vue` declarations to vue-tsc by name (`dts.tsc.vue`), so nothing imports it
      ignoreDependencies: ["vue-tsc"],
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
      // The declaration build hands `.vue` declarations to vue-tsc by name (`dts.tsc.vue`), so nothing imports it
      ignoreDependencies: ["vue-tsc"],
    },
    // A type bench is run by `pnpm bench:types` and imported by nothing, as its fixture is imported by the benches alone
    "packages/headless-block-editor": { entry: ["src/index.ts", "src/**/*.typebench.ts"] },
    // The components suite loads MJML's preset through createRequire, since the preset ships no types, and knip cannot
    // Follow it
    "packages/mjml-blocks": { ignoreDependencies: ["mjml-preset-core"] },
    "packages/nuxt-security-module": {
      // Nitro loads these by the paths `module.ts` resolves, so nothing imports them
      entry: ["src/runtime/nitro/plugins/*.ts", "src/runtime/server/middleware/*.ts"],
    },
    "packages/shared": { entry: ["src/index.ts", "src/**/*.typebench.ts"] },
    // The benchmark reporter imports vitest's types alone, so a consumer that never benches needs no vitest: the peer is
    // Optional on purpose
    "packages/shared-node": { ignoreDependencies: ["vitest"] },
    "packages/tresjs-nuxt": {
      // The components are registered by path, so nothing imports them
      entry: ["src/runtime/TresCanvas.*.ts"],
      // The module imports its optional peer by the name held in GLSL_PACKAGE_NAME when the glsl option is enabled
      ignoreDependencies: ["vite-plugin-glsl"],
    },
    "packages/trpc-nuxt-module": { entry: ["test/fixture/nuxt.config.ts"] },
    // The declaration build hands `.vue` declarations to vue-tsc by name (`dts.tsc.vue`), so nothing imports it
    "packages/vue-phaserjs": { ignoreDependencies: ["vue-tsc"] },
    scripts: {
      // Every command is launched by path through `vpx` (`scripts/package.json`), which knip does not trace, so each
      // Command entry and the shell wrapper's slot gate are named here
      entry: ["src/**/index.ts", "src/oxlint/**/*.ts", "src/services/genshinAssets/kits/gcsim/checkGcsimConfigs.ts"],
      // Loaded by path through createRequire, which knip cannot follow
      ignoreDependencies: ["@wasm-audio-decoders/ogg-vorbis", "jscpd"],
    },
  },
};

export default knipConfiguration;
