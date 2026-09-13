import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("keyframe-store", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 6.75 KB (6909 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();
    expect(getFileSizeReport(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 3.22 KB (3297 bytes)"`);
  });
});
