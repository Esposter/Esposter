import { getFileSize, KIBIBYTE } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("nuxt-security-module", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSize(distFile)).toBeLessThanOrEqual(8 * KIBIBYTE);
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSize(distDtsFile)).toBeLessThanOrEqual(KIBIBYTE);
  });
});
