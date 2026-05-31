import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");
const isWindows = process.platform === "win32";

describe("@esposter/db-mock", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 0.87 KB (886 bytes)"`);
    else expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 0.87 KB (886 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getCrossPlatformSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 0.26 KB (262 bytes)"`);
    else expect(getCrossPlatformSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 0.26 KB (262 bytes)"`);
  });
});
