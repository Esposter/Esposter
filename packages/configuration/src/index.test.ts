import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { getCrossPlatformSize } from "./getCrossPlatformSize";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");
const isWindows = process.platform === "win32";

describe("@esposter/configuration", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 3.64 KB (3725 bytes)"`);
    else expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 3.64 KB (3725 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    if (isWindows)
      expect(getCrossPlatformSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 1.43 KB (1466 bytes)"`);
    else expect(getCrossPlatformSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 1.43 KB (1466 bytes)"`);
  });
});
