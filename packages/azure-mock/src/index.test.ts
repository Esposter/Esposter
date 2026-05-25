import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const isWindows = process.platform === "win32";

describe("azure-mock", () => {
  test("bundle size", () => {
    expect.hasAssertions();
    expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(
      isWindows ? `"index.js: 35.79 KB (36646 bytes)"` : `"index.js: 38.02 KB (38934 bytes)"`,
    );
  });
});
