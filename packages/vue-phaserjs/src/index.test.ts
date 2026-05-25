import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const isWindows = process.platform === "win32";

describe("vue-phaserjs", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(
      isWindows ? `"index.js: 33.95 KB (34762 bytes)"` : `"index.js: 35.74 KB (36599 bytes)"`,
    );
  });
});
