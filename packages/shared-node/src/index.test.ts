import { getFileSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

// The package ships no barrel — the reporter and runner are its only entrypoints.
const distReporterFile = resolve(import.meta.dirname, "../dist/reporter.js");
const distReporterDtsFile = resolve(import.meta.dirname, "../dist/reporter.d.ts");
const distRunnerFile = resolve(import.meta.dirname, "../dist/runner.js");
const distRunnerDtsFile = resolve(import.meta.dirname, "../dist/runner.d.ts");

describe("@esposter/shared-node", () => {
  test("reporter bundle size", () => {
    expect.hasAssertions();
    expect(getFileSize(distReporterFile)).toMatchInlineSnapshot(`"reporter.js: 5.30 KB (5429 bytes)"`);
  });

  test("reporter types size", () => {
    expect.hasAssertions();
    expect(getFileSize(distReporterDtsFile)).toMatchInlineSnapshot(`"reporter.d.ts: 0.31 KB (319 bytes)"`);
  });

  test("runner bundle size", () => {
    expect.hasAssertions();
    expect(getFileSize(distRunnerFile)).toMatchInlineSnapshot(`"runner.js: 0.45 KB (463 bytes)"`);
  });

  test("runner types size", () => {
    expect.hasAssertions();
    expect(getFileSize(distRunnerDtsFile)).toMatchInlineSnapshot(`"runner.d.ts: 0.19 KB (190 bytes)"`);
  });
});
