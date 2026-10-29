import type { ViteUserConfig } from "vitest/config";

import { playwright } from "@vitest/browser-playwright";
import { join } from "node:path";

// The browser suite's own options: the machine's Edge, headless, at the viewport its screens are drawn at, and each
// Screenshot kept beside its component as a test is, so a member sets only what differs from one to the next
export const getVitestBrowserConfiguration = (viewport: {
  height: number;
  width: number;
}): NonNullable<NonNullable<ViteUserConfig["test"]>["browser"]> => ({
  enabled: true,
  expect: {
    toMatchScreenshot: {
      resolveScreenshotPath: ({ arg, ext, root }) => join(root, "src", "components", `${arg}${ext}`),
    },
  },
  headless: true,
  instances: [{ browser: "chromium" }],
  provider: playwright({ launchOptions: { channel: "msedge" } }),
  viewport,
});
