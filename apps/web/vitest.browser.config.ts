import { getVitestBrowserConfiguration } from "@esposter/configuration";
import { defineVitestConfig } from "@nuxt/test-utils/config";

import { getNuxtEnvironmentOptions } from "./configuration/nuxtEnvironmentOptions.ts";

// The browser suite, apart from the default one so an ordinary run never starts a browser: each `*.browser.test.ts`, for
// What only a layout engine shows, under Nuxt's own environment so the app's components and their auto-imports load
export default defineVitestConfig({
  test: {
    browser: getVitestBrowserConfiguration({ height: 900, width: 1440 }),
    environment: "nuxt",
    environmentOptions: getNuxtEnvironmentOptions(import.meta.dirname),
    include: ["app/**/*.browser.test.ts"],
  },
});
