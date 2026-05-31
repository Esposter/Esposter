import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { getCrossPlatformSize } from "./getCrossPlatformSize";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const isWindows = process.platform === "win32";

describe("@esposter/configuration", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 3.20 KB (3281 bytes)"`);
    else expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 3.20 KB (3281 bytes)"`);
  });
});
