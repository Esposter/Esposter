import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { getCrossPlatformSize } from "./getCrossPlatformSize";

const distFile = resolve(import.meta.dirname, "../dist/index.js");

describe("@esposter/configuration", () => {
  test("bundle size", () => {
    expect.hasAssertions();
    expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 4.22 KB (4323 bytes)"`);
  });
});
