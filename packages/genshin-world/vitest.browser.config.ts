import { getVuePlugins, SOURCE_CONDITION } from "@esposter/configuration";
import { templateCompilerOptions } from "@tresjs/core";
import { playwright } from "@vitest/browser-playwright";
import { join } from "node:path";
import { defaultClientConditions } from "vite";
import { defineConfig } from "vitest/config";

// The browser suite, apart from the default one so an ordinary run never starts a browser: every interface screen
// Drawn in the machine's own Edge at 720 pixels high, each image kept beside its component as a test is, and the tests of what
// Only a browser runs
export default defineConfig({
  plugins: getVuePlugins(templateCompilerOptions),
  // Its siblings from their source, as the page reads them
  resolve: { conditions: [SOURCE_CONDITION, ...defaultClientConditions] },
  test: {
    browser: {
      enabled: true,
      expect: {
        toMatchScreenshot: {
          resolveScreenshotPath: ({ arg, ext, platform, root }) =>
            join(root, "src", "components", `${arg}.${platform}${ext}`),
        },
      },
      headless: true,
      instances: [{ browser: "chromium" }],
      provider: playwright({ launchOptions: { channel: "msedge" } }),
      viewport: { height: 720, width: 1280 },
    },
    // The visual suite, and the screens' behaviour where only a browser runs it: the Web Animations and CSS
    // Transitions an opening hands its screens on with
    include: ["parity/*.visual.ts", "src/**/*.browser.test.ts"],
  },
});
