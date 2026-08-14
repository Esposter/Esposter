import { getFileSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

describe("@esposter/infra", () => {
  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 112.45 KB (115152 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();
    expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 10.41 KB (10658 bytes)"`);
  });
});
