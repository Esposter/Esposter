import { defineVitestConfig } from "@nuxt/test-utils/config";

import { dayjs } from "./shared/services/dayjs";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    environmentOptions: {
      nuxt: {
        overrides: {
          unhead: {
            renderSSRHeadOptions: {
              resolvedTags: [],
            },
          },
        },
      },
    },
    hookTimeout: dayjs.duration(60, "seconds").asMilliseconds(),
  },
});
