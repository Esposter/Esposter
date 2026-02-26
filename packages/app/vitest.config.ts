import { defineVitestConfig } from "@nuxt/test-utils/config";

import { dayjs } from "./shared/services/dayjs";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    hookTimeout: dayjs.duration(60, "seconds").asMilliseconds(),
    projects: [
      // V4 schema-org tags:afterResolve unhandled rejection fixed by using node environment for server/** tests via environmentMatchGlobs
      {
        test: {
          name: "node",
          include: ["server/**"],
          environment: "node",
        },
      },
    ],
  },
});
