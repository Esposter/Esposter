import { getVitestBrowserConfiguration } from "@esposter/configuration";
import { defineVitestConfig } from "@nuxt/test-utils/config";

// The browser suite, apart from the default one so an ordinary run never starts a browser: each `*.browser.test.ts`, for
// What only a layout engine shows, under Nuxt's own environment so the app's components and their auto-imports load
export default defineVitestConfig({
  test: {
    browser: getVitestBrowserConfiguration({ height: 900, width: 1440 }),
    environment: "nuxt",
    environmentOptions: { nuxt: { rootDir: import.meta.dirname, url: "http://nuxt.test" } },
    include: ["app/**/*.browser.test.ts"],
  },
});
