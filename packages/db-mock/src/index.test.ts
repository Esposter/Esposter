import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");

describe("@esposter/db-mock", () => {
  test("bundle size", () => {
    expect.hasAssertions();
    expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 0.87 KB (886 bytes)"`);
  });
});
