import { getFileSizeReport } from "@esposter/configuration";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("vue-pdfjs-headless", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: up to 32 KB"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: up to 16 KB"`);
  });

  test("#32 the package's build holds no renderer", () => {
    expect.hasAssertions();

    expect(readFileSync(distFile, "utf8")).not.toContain("pdfjs-dist");
  });
});
