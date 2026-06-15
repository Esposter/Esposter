import { defineVitestConfig } from "@nuxt/test-utils/config";

import { dayjs } from "./shared/services/dayjs";

export default defineVitestConfig({
  test: {
    benchmark: {
      outputJson: "./bench/results.json",
    },
    hookTimeout: dayjs.duration(60, "seconds").asMilliseconds(),
    // DOM globals come from the nuxt environment itself — nuxt-env tests (`// @vitest-environment
    // nuxt`) build their own happy-dom window, so no manual happy-dom registration is needed and
    // node-env tests run without a DOM. `fake-indexeddb/auto` polyfills the IDB* global
    // constructors the `idb` library needs (the nuxt env's own indexedDb mock only sets
    // `indexedDB`); it's cheap and harmless in node-env tests, so it stays global.
    setupFiles: ["fake-indexeddb/auto", "./shared/test/setup.ts"],
  },
});
