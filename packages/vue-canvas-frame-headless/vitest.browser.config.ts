import { getVitestBrowserConfiguration } from "@esposter/configuration";
import { defineConfig } from "vitest/config";

// The browser suite, apart from the default one so an ordinary run never starts a browser: the frame's own document,
// Drawn by the machine's Edge at a desktop viewport, with no Nuxt
export default defineConfig({
  test: { browser: getVitestBrowserConfiguration({ height: 900, width: 1440 }), include: ["src/**/*.browser.test.ts"] },
});
