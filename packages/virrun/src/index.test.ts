import { getFileSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

describe("virrun", () => {
  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 13.71 KB (14034 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();
    expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 144.17 KB (147625 bytes)"`);
  });
});
