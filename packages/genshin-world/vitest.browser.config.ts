import { getVuePlugins } from "@esposter/configuration";
import { playwright } from "@vitest/browser-playwright";
import { basename, dirname, join } from "node:path";
import { defineConfig } from "vitest/config";

// The visual suite, apart from the default one so an ordinary run never starts a browser: every interface screen
// Drawn in the machine's own Edge at 720 pixels high, each image kept beside its component
export default defineConfig({
  plugins: getVuePlugins(),
  test: {
    browser: {
      enabled: true,
      expect: {
        toMatchScreenshot: {
          resolveScreenshotPath: ({ arg, ext, platform, root }) =>
            join(
              root,
              "src",
              "components",
              "interface",
              dirname(arg),
              "__screenshots__",
              `${basename(arg)}.${platform}${ext}`,
            ),
        },
      },
      headless: true,
      instances: [{ browser: "chromium" }],
      provider: playwright({ launchOptions: { channel: "msedge" } }),
      viewport: { height: 720, width: 1280 },
    },
    include: ["parity/*.visual.ts"],
  },
});
