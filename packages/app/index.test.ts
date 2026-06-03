import { getCrossPlatformDirectorySize, getCrossPlatformSize } from "@esposter/configuration";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";

const outputDir = resolve(import.meta.dirname, ".output");
const serverDir = join(outputDir, "server");
const nuxtDir = join(outputDir, "public/_nuxt");
const isWindows = process.platform === "win32";

describe("@esposter/app", () => {
  test("server entry bundle size", () => {
    expect.hasAssertions();

    if (isWindows)
      expect(getCrossPlatformSize(join(serverDir, "index.mjs"))).toMatchInlineSnapshot(
        `"index.mjs: 94.32 KB (96583 bytes)"`,
      );
    else
      expect(getCrossPlatformSize(join(serverDir, "index.mjs"))).toMatchInlineSnapshot(
        `"index.mjs: 0.70 KB (721 bytes)"`,
      );
  });

  test.todo("server total bundle size", () => {
    expect.hasAssertions();

    if (isWindows)
      expect(getCrossPlatformDirectorySize(serverDir)).toMatchInlineSnapshot(`"server: 84492.55 KB (86520372 bytes)"`);
    else
      expect(getCrossPlatformDirectorySize(serverDir)).toMatchInlineSnapshot(`"server: 83980.10 KB (85995627 bytes)"`);
  });

  test("client js bundle size", () => {
    expect.hasAssertions();

    if (isWindows)
      expect(getCrossPlatformDirectorySize(nuxtDir)).toMatchInlineSnapshot(`"_nuxt: 109427.55 KB (112053810 bytes)"`);
    else
      expect(getCrossPlatformDirectorySize(nuxtDir)).toMatchInlineSnapshot(`"_nuxt: 109495.96 KB (112123860 bytes)"`);
  });
});
