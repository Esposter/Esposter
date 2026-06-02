import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");
const isWindows = process.platform === "win32";

describe("@esposter/db", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    if (isWindows)
      expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 1094.68 KB (1120952 bytes)"`);
    else expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 1094.68 KB (1120952 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    if (isWindows)
      expect(getCrossPlatformSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 167.53 KB (171548 bytes)"`);
    else expect(getCrossPlatformSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 167.50 KB (171521 bytes)"`);
  });
});
