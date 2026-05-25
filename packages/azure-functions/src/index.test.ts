import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const isWindows = process.platform === "win32";

describe("@esposter/azure-functions", () => {
  test("bundle size", () => {
    expect.hasAssertions();
    expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(
      isWindows ? `"index.js: 4229.13 KB (4330631 bytes)"` : `"index.js: 4494.66 KB (4602535 bytes)"`,
    );
  });
});
