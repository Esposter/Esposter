import { getFileSize, KIBIBYTE } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("@esposter/shared-node", () => {
  // The package ships no barrel — the reporter and the bench run options are its only entrypoints. Neither has
  // A `.d.ts` to measure: this package is private, and `getTsdownConfiguration` emits no declarations for one,
  // Because everything that types against a workspace package resolves the source condition and reads its
  // TypeScript.
  const distBenchFile = resolve(import.meta.dirname, "../dist/bench.js");
  const distReporterFile = resolve(import.meta.dirname, "../dist/reporter.js");

  test("bench bundle size", () => {
    expect.hasAssertions();

    expect(getFileSize(distBenchFile)).toBeLessThanOrEqual(0.25 * KIBIBYTE);
  });

  test("reporter bundle size", () => {
    expect.hasAssertions();

    expect(getFileSize(distReporterFile)).toBeLessThanOrEqual(8 * KIBIBYTE);
  });
});
