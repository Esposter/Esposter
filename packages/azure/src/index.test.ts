import { getFileSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("@esposter/azure", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 2.07 KB (2121 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();
    expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 5.51 KB (5642 bytes)"`);
  });
});
