import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("virrun", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 16.79 KB (17189 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();
    expect(getFileSizeReport(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 301.63 KB (308864 bytes)"`);
  });
});
