import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const isWindows = process.platform === "win32";

describe("@esposter/db-schema", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(
      isWindows ? `"index.js: 64.42 KB (65963 bytes)"` : `"index.js: 65.68 KB (67260 bytes)"`,
    );
  });
});
