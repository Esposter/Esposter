import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");

describe("@esposter/azure-functions", () => {
  test("bundle size", () => {
    expect.hasAssertions();
    expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 4229.13 KB (4330631 bytes)"`);
  });
});
