import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("vue-grid-layout-headless", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distPlacementFile = resolve(import.meta.dirname, "../dist/placement.js");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 0.07 KB (70 bytes)"`);
  });

  test("placement bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distPlacementFile)).toMatchInlineSnapshot(`"placement.js: 3.66 KB (3747 bytes)"`);
  });
});
