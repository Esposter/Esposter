import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("genshin-interface", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 162.38 KB (166282 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 45.06 KB (46138 bytes)"`);
  });
});
