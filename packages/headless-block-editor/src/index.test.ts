import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("headless-block-editor", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 13.08 KB (13390 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 7.62 KB (7802 bytes)"`);
  });
});
