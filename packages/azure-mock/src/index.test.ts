import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("azure-mock", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 44.26 KB (45325 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();
    expect(getFileSizeReport(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 50.26 KB (51468 bytes)"`);
  });
});
