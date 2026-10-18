import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("vue-grid-layout-headless", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");
  const distPlacementFile = resolve(import.meta.dirname, "../dist/placement.js");
  const distPlacementDtsFile = resolve(import.meta.dirname, "../dist/placement.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 9.38 KB (9601 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 1.90 KB (1949 bytes)"`);
  });

  test("placement bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distPlacementFile)).toMatchInlineSnapshot(`"placement.js: 0.31 KB (314 bytes)"`);
  });

  test("placement types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distPlacementDtsFile)).toMatchInlineSnapshot(`"placement.d.ts: 2.56 KB (2619 bytes)"`);
  });
});
