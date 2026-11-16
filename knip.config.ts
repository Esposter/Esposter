import type { KnipConfig } from "knip";

const knipConfiguration: KnipConfig = {
  exclude: ["types"],
  ignoreBinaries: ["pwsh"],
  ignoreExportsUsedInFile: true,
  // @TODO: https://github.com/webpro-nl/knip/issues/2399 — drop it once an `import.meta.glob` pattern resolves
  // Through the manifest's subpath imports, the only users of the app's `#src/*.html`, `*.tsx` and `*.wasm` patterns
  ignoreIssues: { "apps/web/package.json": ["subpaths"] },
  // A workspace's `entry` replaces knip's default `src/index.ts`, so a package that sets one lists its barrel too
  workspaces: {
    ".": {
      // The composite action runs `wrangler` in a Worker app's directory, whose devDependency provides it
      ignoreBinaries: ["wrangler"],
      // The `lint:workflows` task in `vite/checkTasks.ts` runs this package's binary, which no script names
      // The OpenSpec skill invokes this CLI with `pnpm exec`, which Knip does not trace from skill prose
      ignoreDependencies: [
        "@esposter/shared-node",
        "@fission-ai/openspec",
        "@kjanat/actionlint",
        "@lerna-lite/publish",
      ],
    },
    "apps/infra": { entry: ["src/**/*.ts"] },
    "apps/jobs": { entry: ["src/**/*.ts"] },
    "apps/realtime": { entry: ["src/**/*.ts"] },
    "apps/web": {
      // A development route's handler is registered by its path from a module under `nuxt dev` alone, so nothing imports it
      // `service-worker/sw.ts` is bundled by the PWA module from `srcDir`, which knip does not follow
      entry: [
        "app/App.vue",
        "app/components/**/*.vue",
        "server/development/*.ts",
        // The bindings' declaration is ambient for the server program and named from inside the browser programs'
        // `declare module "cloudflare:workers"`, which knip does not read
        "server/types/cloudflare.d.ts",
        "server/services/devSession/postDevSession.ts",
        "service-worker/sw.ts",
        // @TODO: https://github.com/webpro-nl/knip/issues/2399 — drop it once an `import.meta.glob` pattern resolves
        // Through the manifest's subpath imports, which reach each worker and worklet
        "app/workers/**/*.ts",
      ],
      // @TODO: https://github.com/webpro-nl/knip/issues/2399 — drop `app/assets/**` once the tileset glob is followed,
      // Since knip reads its Tiled `.tsx` definitions as unused source
      ignore: ["app/assets/**", "public/**", "shared/generated/**"],
      ignoreDependencies: [
        "@iconify-json/.+",
        "@takumi-rs/core",
        // `tresjs-nuxt` registers the components of every `@tresjs` package the app declares, so the templates name
        // Cientos's components and nothing imports the package
        "@tresjs/cientos",
        // The PWA engine's register code is a virtual module that imports it, which Vite resolves from the app's root, so
        // The app declares it and nothing in the app imports it (vite-pwa/unplugin-pwa#48)
        "@vite-pwa/workbox-window",
        "@vueuse/router",
        // @TODO: https://github.com/nuxt/scripts/pull/946 — drop it once a stable `@nuxt/scripts` 2 ships it (it is in
        // 2.0.0-beta.13). 1.x mounts its `nuxt-scripts-cache` storage on unstorage's lru-cache driver, which loads
        // `lru-cache` without declaring it, so the app declares it, nothing in the app imports it, and without it
        // `nuxt prepare` fails under CI's install
        "lru-cache",
        // @TODO: https://github.com/nuxt/nuxt/releases/tag/v5.0.0 — knip reads an `#app` import as the package it
        // Resolves to, which is the `nuxt-nightly` alias until the catalog's `nuxt` is a range again
        "nuxt-nightly",
        // Nuxt loads it by name when `nuxt analyze` turns `build.analyze` on, for the dependency score's bundle column, so
        // Nothing in the app imports it
        "rollup-plugin-visualizer",
        "temporal-polyfill",
        // The module is registered by its source path in `configuration/modules.ts`, which `nuxt prepare` loads before any
        // Workspace package is built, so the app declares it for a narrowed install and nothing imports it
        "tresjs-nuxt",
      ],
    },
    // Each Durable Object's schema has its own drizzle config, which `db:gen` passes to drizzle-kit by path
    "packages/db-schema": { entry: ["src/index.ts", "drizzle.*.config.ts"] },
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
      ignoreDependencies: ["claude-code"],
    },
    "packages/genshin-world": {
      entry: ["parity/*.visual.ts", "src/index.ts", "src/**/*.reference.ts", "src/workers/*.ts"],
    },
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
    "packages/unplugin-pwa-nuxt": {
      // The build test runs `nuxt build` over the fixture app, so its config, its server route and its worker are named by
      // Path
      entry: [
        "test/fixture/nuxt.config.ts",
        "test/fixture/server/api/hello.get.ts",
        "test/fixture/service-worker/sw.ts",
      ],
      // The fixture app builds the engine's register code, a virtual module that imports it, so nothing here does
      ignoreDependencies: ["@vite-pwa/workbox-window"],
    },
    // A type bench is run by `pnpm bench:types` and imported by nothing, as its fixture is imported by the benches alone
    "packages/vue-block-editor-headless": { entry: ["src/index.ts", "src/**/*.typebench.ts"] },
    scripts: {
      // Knip follows each `node` command entry from the manifest; the oxlint plugins load by path from the root config
      entry: ["src/oxlint/**/*.ts"],
      // Loaded by path through createRequire, which knip cannot follow
      ignoreDependencies: ["jscpd"],
    },
  },
};

export default knipConfiguration;
