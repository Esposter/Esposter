import { getFileSize, KIBIBYTE } from "@esposter/configuration";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("vue-pdfjs-headless", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSize(distFile)).toBeLessThanOrEqual(64 * KIBIBYTE);
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSize(distDtsFile)).toBeLessThanOrEqual(16 * KIBIBYTE);
  });

  test("#32 the package's build holds no renderer", () => {
    expect.hasAssertions();

    expect(readFileSync(distFile, "utf8")).not.toContain("pdfjs-dist");
  });
});
