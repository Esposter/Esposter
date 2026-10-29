import { getVitestBrowserConfiguration } from "#src/services/getVitestBrowserConfiguration";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

describe(getVitestBrowserConfiguration, () => {
  const resolveScreenshotPath = getVitestBrowserConfiguration({ height: 1, width: 1 }).expect?.toMatchScreenshot
    ?.resolveScreenshotPath as (options: { arg: string; ext: string; platform: string; root: string }) => string;

  test("compares every pixel exactly when the update variable it names is set", () => {
    expect.hasAssertions();

    vi.stubEnv("VISUAL_UPDATE", "true");

    expect(
      getVitestBrowserConfiguration({ height: 1, width: 1 }, { updateEnvironmentVariable: "VISUAL_UPDATE" }).expect,
    ).toMatchObject({ toMatchScreenshot: { comparatorOptions: { threshold: 0 } } });
    expect(getVitestBrowserConfiguration({ height: 1, width: 1 }).expect?.toMatchScreenshot).not.toHaveProperty(
      "comparatorOptions",
    );
    vi.unstubAllEnvs();
  });

  test("names a screenshot the same on Windows as on macOS", () => {
    expect.hasAssertions();

    expect(resolveScreenshotPath({ arg: "Index", ext: ".png", platform: "win32", root: "/root" })).toBe(
      join("/root", "src", "components", "Index.png"),
    );
  });
});
