import { defineVitestProject } from "@nuxt/test-utils/config";

import { dayjs } from "./shared/services/dayjs";

export default await defineVitestProject({
  test: {
    benchmark: {
      outputJson: "./bench/results.json",
    },
    // Root the Nuxt project at this package, not the vitest cwd (the repo root, where `@nuxt/kit` and the
    // App don't resolve) — required now that the run is driven by the root `projects` config.
    environmentOptions: { nuxt: { rootDir: import.meta.dirname } },
    hookTimeout: dayjs.duration(60, "seconds").asMilliseconds(),
    // DOM globals come from the nuxt environment itself: nuxt-env tests (`// @vitest-environment nuxt`)
    // Build their own happy-dom window, so no manual happy-dom registration is needed, and tests in
    // The node environment run without a DOM. `fake-indexeddb/auto` polyfills the IDB* global
    // Constructors the `idb` library needs (the nuxt env's indexedDb mock only sets `indexedDB`); it's
    // Cheap and harmless for node tests, so it stays global.
    setupFiles: ["fake-indexeddb/auto", "./shared/test/setup.ts"],
  },
});
