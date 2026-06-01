import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");
const isWindows = process.platform === "win32";

describe("@esposter/shared", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 383.91 KB (393119 bytes)"`);
    else expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 383.91 KB (393119 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    if (isWindows)
      expect(getCrossPlatformSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 109.98 KB (112623 bytes)"`);
    else expect(getCrossPlatformSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 109.98 KB (112623 bytes)"`);
  });
});
