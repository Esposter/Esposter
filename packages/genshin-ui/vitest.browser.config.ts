import { getVuePlugins, SOURCE_CONDITION } from "@esposter/configuration";
import { playwright } from "@vitest/browser-playwright";
import { join } from "node:path";
import { defaultClientConditions } from "vite";
import { defineConfig } from "vitest/config";

// The browser suite, apart from the default one so an ordinary run never starts a browser: every component drawn on a
// Game screen in the machine's own Edge at the game's 1080 pixels high, where a unit is a pixel, each image kept
// Beside its component as a test is
export default defineConfig({
  plugins: getVuePlugins(),
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
      viewport: { height: 1080, width: 1920 },
    },
    include: ["src/**/*.visual.ts"],
  },
});
