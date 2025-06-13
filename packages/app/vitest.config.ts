import { dayjs } from "#shared/services/dayjs";
import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    hookTimeout: dayjs.duration(60, "seconds").asMilliseconds(),
  },
});
