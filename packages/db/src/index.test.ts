import { getFileSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

describe("@esposter/db", () => {
  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 1152.66 KB (1180321 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();
    expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 33.69 KB (34496 bytes)"`);
  });
});
