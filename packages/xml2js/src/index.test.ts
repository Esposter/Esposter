import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const isWindows = process.platform === "win32";

describe("@esposter/xml2js", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    if (isWindows)
      expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 1117.27 KB (1144087 bytes)"`);
    else expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 994.52 KB (1018388 bytes)"`);
  });
});
