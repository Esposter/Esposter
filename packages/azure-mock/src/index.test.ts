import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");
const isWindows = process.platform === "win32";

describe("azure-mock", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 36.55 KB (37429 bytes)"`);
    else expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 36.55 KB (37429 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    if (isWindows)
      expect(getCrossPlatformSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 42.49 KB (43506 bytes)"`);
    else expect(getCrossPlatformSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 43.84 KB (44891 bytes)"`);
  });
});
