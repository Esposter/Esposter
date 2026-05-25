import { getCrossPlatformDirectorySize, getCrossPlatformSize } from "@esposter/configuration";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";

const outputDir = resolve(import.meta.dirname, ".output");
const serverDir = join(outputDir, "server");
const nuxtDir = join(outputDir, "public/_nuxt");

describe("@esposter/app", () => {
  test("server entry bundle size", () => {
    expect.hasAssertions();
    expect(getCrossPlatformSize(join(serverDir, "index.mjs"))).toMatchInlineSnapshot(
      `"index.mjs: 102.14 KB (104589 bytes)"`,
    );
  });

  test("server total bundle size", () => {
    expect.hasAssertions();
    expect(getCrossPlatformDirectorySize(serverDir)).toMatchInlineSnapshot(`"server: 84484.85 KB (86512489 bytes)"`);
  });

  test("client js bundle size", () => {
    expect.hasAssertions();
    expect(getCrossPlatformDirectorySize(nuxtDir)).toMatchInlineSnapshot(`"_nuxt: 109352.28 KB (111976738 bytes)"`);
  });
});
