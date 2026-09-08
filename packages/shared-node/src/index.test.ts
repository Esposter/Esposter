import { getFileSizeReport } from "@esposter/configuration";
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
    expect(getFileSizeReport(distBenchFile)).toMatchInlineSnapshot(`"bench.js: 0.18 KB (182 bytes)"`);
  });

  test("reporter bundle size", () => {
    expect.hasAssertions();
    expect(getFileSizeReport(distReporterFile)).toMatchInlineSnapshot(`"reporter.js: 5.42 KB (5546 bytes)"`);
  });
});
