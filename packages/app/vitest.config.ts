import { getBenchmarkPlugins } from "@esposter/configuration";
import { defineVitestProject } from "@nuxt/test-utils/config";

import { dayjs } from "./shared/services/dayjs";

export default await defineVitestProject({
  // `defineVitestProject` doesn't call `getVitestConfiguration`, so wire the bench plugin via the shared
  // Helper (inert unless the CodSpeed runner drives the run). The app benches, so it declares
  // `@codspeed/vitest-plugin` as a devDependency to satisfy configuration's optional peer.
  plugins: getBenchmarkPlugins(),
  test: {
    // Reporter wired inline (same reason): path string resolved by Vitest in bench mode to shared-node's
    // `./reporter` default export, which writes colocated per-file results.
    benchmark: {
      reporters: ["@esposter/shared-node/reporter"],
    },
    // Root the Nuxt project at this package, not the vitest cwd (the repo root, where `@nuxt/kit` and the
    // App don't resolve) — required now that the run is driven by the root `projects` config.
    environmentOptions: { nuxt: { rootDir: import.meta.dirname } },
    // Cold `setupNuxt()` (the nuxt-env `beforeAll`) builds Nuxt on first use, which can exceed several minutes
    // On a loaded CI runner and trips "Hook timed out". 5 min gives the cold build ample headroom.
    hookTimeout: dayjs.duration(5, "minutes").asMilliseconds(),
    // DOM globals come from the nuxt environment itself: nuxt-env tests (`// @vitest-environment nuxt`)
    // Build their own happy-dom window, so no manual happy-dom registration is needed, and tests in
    // The node environment run without a DOM. `fake-indexeddb/auto` polyfills the IDB* global
    // Constructors the `idb` library needs (the nuxt env's indexedDb mock only sets `indexedDB`); it's
    // Cheap and harmless for node tests, so it stays global.
    setupFiles: ["fake-indexeddb/auto", "./shared/test/setup.ts"],
  },
});
