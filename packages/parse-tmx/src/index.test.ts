import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");

describe("parse-tmx", () => {
  test("bundle size", () => {
    expect.hasAssertions();
    expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 815.38 KB (834954 bytes)"`);
  });
});
