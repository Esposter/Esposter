import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { getCrossPlatformSize } from "./getCrossPlatformSize";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const isWindows = process.platform === "win32";

describe("@esposter/configuration", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(
      isWindows ? `"index.js: 4.31 KB (4413 bytes)"` : `"index.js: 4.42 KB (4521 bytes)"`,
    );
  });
});
