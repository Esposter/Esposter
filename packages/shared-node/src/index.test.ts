import { getFileSize, KIBIBYTE } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("@esposter/shared-node", () => {
  // The package ships no barrel, so each entry is its own file in dist.
  // The bench run options and the reporter are the two a Vitest run loads, so their bundles are held.
  // The package is published, so every entry emits declarations, and each declaration file is held too.
  const distBenchFile = resolve(import.meta.dirname, "../dist/bench.js");
  const distReporterFile = resolve(import.meta.dirname, "../dist/reporter.js");
  const distBenchDtsFile = resolve(import.meta.dirname, "../dist/bench.d.ts");
  const distCacheDtsFile = resolve(import.meta.dirname, "../dist/cache.d.ts");
  const distChildProcessDtsFile = resolve(import.meta.dirname, "../dist/child-process.d.ts");
  const distReporterDtsFile = resolve(import.meta.dirname, "../dist/reporter.d.ts");

  test("bench bundle size", () => {
    expect.hasAssertions();

    expect(getFileSize(distBenchFile)).toBeLessThanOrEqual(0.25 * KIBIBYTE);
  });

  test("reporter bundle size", () => {
    expect.hasAssertions();

    expect(getFileSize(distReporterFile)).toBeLessThanOrEqual(8 * KIBIBYTE);
  });

  test("bench types size", () => {
    expect.hasAssertions();

    expect(getFileSize(distBenchDtsFile)).toBeLessThanOrEqual(0.25 * KIBIBYTE);
  });

  test("cache types size", () => {
    expect.hasAssertions();

    expect(getFileSize(distCacheDtsFile)).toBeLessThanOrEqual(0.5 * KIBIBYTE);
  });

  test("child-process types size", () => {
    expect.hasAssertions();

    expect(getFileSize(distChildProcessDtsFile)).toBeLessThanOrEqual(KIBIBYTE);
  });

  test("reporter types size", () => {
    expect.hasAssertions();

    expect(getFileSize(distReporterDtsFile)).toBeLessThanOrEqual(0.25 * KIBIBYTE);
  });
});
