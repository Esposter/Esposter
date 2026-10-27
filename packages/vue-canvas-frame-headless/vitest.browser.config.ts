import type { ViteUserConfig } from "vitest/config";

import { getVitestBrowserConfiguration } from "@esposter/configuration";
import { defineConfig } from "vitest/config";

// The browser suite, apart from the default one so an ordinary run never starts a browser.
// It draws the frame's own document in the machine's Edge at a desktop viewport, with no Nuxt
const vitestBrowserConfiguration: ViteUserConfig = defineConfig({
  test: { browser: getVitestBrowserConfiguration({ height: 900, width: 1440 }), include: ["src/**/*.browser.test.ts"] },
});

export default vitestBrowserConfiguration;
