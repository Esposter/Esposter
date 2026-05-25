import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");

describe("@esposter/infra", () => {
  test("bundle size", () => {
    expect.hasAssertions();
    expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 121.24 KB (124151 bytes)"`);
  });
});
