import { defineVitestConfig } from "@nuxt/test-utils/config";

import { dayjs } from "./shared/services/dayjs";

export default defineVitestConfig({
  benchmark: {
    outputJson: "./bench/results.json",
  },
  test: {
    environment: "nuxt",
    hookTimeout: dayjs.duration(60, "seconds").asMilliseconds(),
  },
});
