import { getCrossPlatformSize } from "@esposter/configuration";
import { readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";

const outputDir = resolve(import.meta.dirname, ".output");
const serverDir = join(outputDir, "server");
const nuxtDir = join(outputDir, "public/_nuxt");
const getTotalDirSize = (dir: string): number =>
  readdirSync(dir, { withFileTypes: true }).reduce((total, entry) => {
    const fullPath = join(dir, entry.name);
    return total + (entry.isDirectory() ? getTotalDirSize(fullPath) : statSync(fullPath).size);
  }, 0);

describe("@esposter/app", () => {
  test("server entry bundle size", () => {
    expect.hasAssertions();
    expect(getCrossPlatformSize(join(serverDir, "index.mjs"))).toMatchInlineSnapshot();
  });

  test("server total bundle size", () => {
    expect.hasAssertions();
    expect(getTotalDirSize(serverDir)).toMatchInlineSnapshot();
  });

  test("client js bundle size", () => {
    expect.hasAssertions();
    expect(getTotalDirSize(nuxtDir)).toMatchInlineSnapshot();
  });
});
