import { getVitestBrowserConfiguration } from "#src/services/getVitestBrowserConfiguration";
import { describe, expect, test } from "vitest";
import { join } from "node:path";

describe(getVitestBrowserConfiguration, () => {
  const resolveScreenshotPath = getVitestBrowserConfiguration({ height: 1, width: 1 }).expect?.toMatchScreenshot
    ?.resolveScreenshotPath as (options: { arg: string; ext: string; platform: string; root: string }) => string;

  test("names a screenshot the same on Windows as on macOS", () => {
    expect.hasAssertions();

    expect(resolveScreenshotPath({ arg: "Index", ext: ".png", platform: "win32", root: "/root" })).toBe(
      join("/root", "src", "components", "Index.png"),
    );
  });

  test("names a screenshot the same on macOS as on Windows", () => {
    expect.hasAssertions();

    expect(resolveScreenshotPath({ arg: "Index", ext: ".png", platform: "darwin", root: "/root" })).toBe(
      join("/root", "src", "components", "Index.png"),
    );
  });
});
