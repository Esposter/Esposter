import { getCrossPlatformDirectorySize, getCrossPlatformSize } from "@esposter/configuration";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";

const outputDir = resolve(import.meta.dirname, ".output");
const serverDir = join(outputDir, "server");
const nuxtDir = join(outputDir, "public/_nuxt");

describe("@esposter/app", () => {
  test("server entry bundle size", () => {
    expect.hasAssertions();
    expect(getCrossPlatformSize(join(serverDir, "index.mjs"))).toMatchInlineSnapshot();
  });

  test("server total bundle size", () => {
    expect.hasAssertions();
    expect(getCrossPlatformDirectorySize(serverDir)).toMatchInlineSnapshot();
  });

  test("client js bundle size", () => {
    expect.hasAssertions();
    expect(getCrossPlatformDirectorySize(nuxtDir)).toMatchInlineSnapshot();
  });
});
