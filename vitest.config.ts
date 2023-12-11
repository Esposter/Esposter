import { defineVitestConfig } from "nuxt-vitest/config";

export default defineVitestConfig({
  // @ts-expect-error @TODO
  test: {
    environment: "nuxt",
  },
});
