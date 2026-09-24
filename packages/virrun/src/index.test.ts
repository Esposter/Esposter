import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("virrun", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 162.51 KB (166410 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 308.70 KB (316111 bytes)"`);
  });
});
