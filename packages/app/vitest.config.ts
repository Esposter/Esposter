import { defineVitestConfig } from "@nuxt/test-utils/config";

import { dayjs } from "./shared/services/dayjs";

export default defineVitestConfig({
  test: {
    benchmark: {
      outputJson: "./bench/results.json",
    },
    environment: "nuxt",
    hookTimeout: dayjs.duration(60, "seconds").asMilliseconds(),
    // Fake-indexeddb/auto polyfills ALL IndexedDB globals (IDBDatabase, IDBObjectStore, etc.)
    // The nuxt mock `indexedDb: true` only sets `indexedDB` itself, but the `idb` library's
    // Proxy mechanism also requires the class constructors (IDBDatabase, IDBObjectStore, etc.)
    // To be available as globals — without them, idb operations silently fail
    setupFiles: ["fake-indexeddb/auto"],
  },
});
