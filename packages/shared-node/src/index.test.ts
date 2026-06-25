import { getFileSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

describe("@esposter/shared-node", () => {
  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 1.12 KB (1148 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();
    expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 2.47 KB (2534 bytes)"`);
  });
});
