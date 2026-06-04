import { getDirectorySize, getFileSize } from "@esposter/configuration";
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
      expect(getFileSize(join(serverDir, "index.mjs"))).toMatchInlineSnapshot(`"index.mjs: 94.31 KB (96577 bytes)"`);
    else expect(getFileSize(join(serverDir, "index.mjs"))).toMatchInlineSnapshot(`"index.mjs: 0.73 KB (748 bytes)"`);
  });

  test.todo("server total bundle size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getDirectorySize(serverDir)).toMatchInlineSnapshot(`"server: 84492.55 KB (86520372 bytes)"`);
    else expect(getDirectorySize(serverDir)).toMatchInlineSnapshot(`"server: 83980.10 KB (85995627 bytes)"`);
  });

  test("client js bundle size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getDirectorySize(nuxtDir)).toMatchInlineSnapshot(`"_nuxt: 109506.37 KB (112134526 bytes)"`);
    else expect(getDirectorySize(nuxtDir)).toMatchInlineSnapshot(`"_nuxt: 109502.46 KB (112130523 bytes)"`);
  });
});
