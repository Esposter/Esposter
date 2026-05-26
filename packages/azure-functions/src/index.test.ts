import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const isWindows = process.platform === "win32";

describe("@esposter/azure-functions", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    if (isWindows)
      expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 4229.13 KB (4330632 bytes)"`);
    else expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 4235.05 KB (4336692 bytes)"`);
  });
});
