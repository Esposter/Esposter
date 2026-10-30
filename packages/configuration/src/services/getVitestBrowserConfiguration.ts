import type { ViteUserConfig } from "vitest/config";

import { playwright } from "@vitest/browser-playwright";
import { join } from "node:path";

type BrowserConfiguration = NonNullable<NonNullable<ViteUserConfig["test"]>["browser"]>;

// Whether this run writes images: `-u`, `--update`, or the environment variable a suite names as its update variable
const checkVisualUpdate = (updateEnvironmentVariable?: string): boolean =>
  (updateEnvironmentVariable !== undefined && Boolean(process.env[updateEnvironmentVariable])) ||
  process.argv.includes("-u") ||
  process.argv.includes("--update");

// The browser suite's own options: the machine's Edge, headless, at the viewport its screens are drawn at, and each
// Screenshot kept beside its component as a test is, so a member sets only what differs from one to the next. An update
// (`-u` or `--update`, or the environment variable a suite names as `updateEnvironmentVariable`) compares every pixel
// Exactly, so the image it writes is the render: the default comparison passes a drift below pixelmatch's threshold, and
// An update only rewrites a comparison that fails. The same argument also gives the define that sets `IS_VISUAL_UPDATE`
// For the suite's own tests, so the flag the options take and the one the tests read cannot come apart
export const getVitestBrowserConfiguration = (
  viewport: { height: number; width: number },
  { updateEnvironmentVariable }: { updateEnvironmentVariable?: string } = {},
): { browser: BrowserConfiguration; define: { IS_VISUAL_UPDATE: string } } => {
  const isUpdating = checkVisualUpdate(updateEnvironmentVariable);
  const browser: BrowserConfiguration = {
    enabled: true,
    expect: {
      toMatchScreenshot: {
        resolveScreenshotPath: ({ arg, ext, root }) => join(root, "src", "components", `${arg}${ext}`),
      },
    },
    // The captures a suite takes for its own checks are not images, so they stay out of the suite's folders, in
    // `node_modules`, which git ignores
    headless: true,
    instances: [{ browser: "chromium" }],
    provider: playwright({ launchOptions: { channel: "msedge" } }),
    screenshotDirectory: "node_modules/.vitest/screenshots",
    viewport,
  };
  if (isUpdating)
    browser.expect = {
      toMatchScreenshot: { ...browser.expect?.toMatchScreenshot, comparatorOptions: { threshold: 0 } },
    };
  return { browser, define: { IS_VISUAL_UPDATE: JSON.stringify(isUpdating) } };
};
