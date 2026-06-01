import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");
const isWindows = process.platform === "win32";

describe("@esposter/db-schema", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 64.59 KB (66142 bytes)"`);
    else expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 64.59 KB (66142 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    if (isWindows)
      expect(getCrossPlatformSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 3632.85 KB (3720037 bytes)"`);
    else expect(getCrossPlatformSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 3634.14 KB (3721360 bytes)"`);
  });
});
