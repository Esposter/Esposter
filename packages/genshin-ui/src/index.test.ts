import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("genshin-ui", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 32.38 KB (33155 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 12.50 KB (12801 bytes)"`);
  });
});
