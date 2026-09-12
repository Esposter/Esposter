import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("keyframe-store", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 6.49 KB (6646 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();
    expect(getFileSizeReport(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 2.99 KB (3057 bytes)"`);
  });
});
