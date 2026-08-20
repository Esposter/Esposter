import { getFileSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("azure-mock", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 41.41 KB (42402 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();
    expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 44.81 KB (45883 bytes)"`);
  });
});
