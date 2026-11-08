import { getVitestBrowserConfiguration } from "#src/services/getVitestBrowserConfiguration";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(getVitestBrowserConfiguration, () => {
  const TEMP_DIRECTORY_PREFIX = "a";
  const resolveScreenshotPath = getVitestBrowserConfiguration({ height: 1, width: 1 }).browser.expect?.toMatchScreenshot
    ?.resolveScreenshotPath as (options: { arg: string; ext: string; platform: string; root: string }) => string;
  let screenshotRoot = "";

  // The images of one screen sit in its folder under the components, the folder the suites' names resolve into
  const writeScreenImages = (...imageNames: string[]) => {
    const screenDirectory = join(screenshotRoot, "src", "components", "Screen");
    mkdirSync(screenDirectory, { recursive: true });

    for (const imageName of imageNames) writeFileSync(join(screenDirectory, imageName), "");
  };

  beforeEach(() => {
    screenshotRoot = mkdtempSync(join(tmpdir(), TEMP_DIRECTORY_PREFIX));
  });

  afterEach(() => {
    rmSync(screenshotRoot, { force: true, recursive: true });
  });

  test("compares every pixel exactly when the update variable it names is set", () => {
    expect.hasAssertions();

    vi.stubEnv("VISUAL_UPDATE", "true");

    expect(
      getVitestBrowserConfiguration({ height: 1, width: 1 }, { updateEnvironmentVariable: "VISUAL_UPDATE" }).browser
        .expect?.toMatchScreenshot?.comparatorOptions,
    ).toStrictEqual({ threshold: 0 });
    expect(getVitestBrowserConfiguration({ height: 1, width: 1 }).browser.expect?.toMatchScreenshot).not.toHaveProperty(
      "comparatorOptions",
    );
    vi.unstubAllEnvs();
  });

  test("defines the flag its tests read as an update when the update variable it names is set", () => {
    expect.hasAssertions();

    vi.stubEnv("VISUAL_UPDATE", "true");

    expect(
      getVitestBrowserConfiguration({ height: 1, width: 1 }, { updateEnvironmentVariable: "VISUAL_UPDATE" }).define,
    ).toStrictEqual({ IS_VISUAL_UPDATE: "true" });
    expect(getVitestBrowserConfiguration({ height: 1, width: 1 }).define).toStrictEqual({ IS_VISUAL_UPDATE: "false" });
    vi.unstubAllEnvs();
  });

  test.each([
    { machine: "Windows", platform: "win32" },
    { machine: "macOS", platform: "darwin" },
  ])("image name on a $machine machine", ({ platform }) => {
    expect.hasAssertions();

    expect(resolveScreenshotPath({ arg: "Index", ext: ".png", platform, root: "/root" })).toBe(
      join("/root", "src", "components", "Index.png"),
    );
  });

  test("two approved images for one screen fail the run and name the screen", () => {
    expect.hasAssertions();

    writeScreenImages("Index.png", "Index.win32.png");

    expect(() =>
      resolveScreenshotPath({ arg: "Screen/Index", ext: ".png", platform: "win32", root: screenshotRoot }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Screen/Index has more than one approved image: Index.png, Index.win32.png]`,
    );
  });

  test("a variant's image beside its base is not a second approved image", () => {
    expect.hasAssertions();

    writeScreenImages("Index.png", "Index-dusk.png");

    expect(resolveScreenshotPath({ arg: "Screen/Index", ext: ".png", platform: "win32", root: screenshotRoot })).toBe(
      join(screenshotRoot, "src", "components", "Screen", "Index.png"),
    );
  });
});
