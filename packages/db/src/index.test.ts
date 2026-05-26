import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const isWindows = process.platform === "win32";

describe("@esposter/db", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    if (isWindows)
      expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 1094.68 KB (1120954 bytes)"`);
    else expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 1094.68 KB (1120954 bytes)"`);
  });
});
