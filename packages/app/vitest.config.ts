import { defineVitestConfig } from "@nuxt/test-utils/config";

import { dayjs } from "./shared/services/dayjs";

export default defineVitestConfig({
  test: {
    benchmark: {
      outputJson: "./bench/results.json",
    },
    environment: "nuxt",
    environmentOptions: {
      nuxt: {
        mock: {
          indexedDb: true,
        },
      },
    },
    hookTimeout: dayjs.duration(60, "seconds").asMilliseconds(),
    server: {
      deps: {
        // Inline idb so it runs inside the fake-indexeddb test environment
        // Instead of being externalized to native Node where indexedDB is unavailable
        inline: ["idb"],
      },
    },
  },
});
