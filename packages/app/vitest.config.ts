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
  },
});
