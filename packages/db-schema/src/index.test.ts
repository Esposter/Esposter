import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");

describe("@esposter/db-schema", () => {
  test("bundle size", () => {
    expect.hasAssertions();
    expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 64.42 KB (65963 bytes)"`);
  });
});
