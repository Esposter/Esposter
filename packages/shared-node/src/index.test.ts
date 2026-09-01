import { getFileSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("@esposter/shared-node", () => {
  // The package ships no barrel — the reporter and runner are its only entrypoints. Neither has a `.d.ts` to
  // Measure: this package is private, and `getTsdownConfiguration` emits no declarations for one, because
  // Everything that types against a workspace package resolves the source condition and reads its TypeScript.
  const distReporterFile = resolve(import.meta.dirname, "../dist/reporter.js");
  const distRunnerFile = resolve(import.meta.dirname, "../dist/runner.js");

  test("reporter bundle size", () => {
    expect.hasAssertions();
    expect(getFileSize(distReporterFile)).toMatchInlineSnapshot(`"reporter.js: 5.61 KB (5745 bytes)"`);
  });

  test("runner bundle size", () => {
    expect.hasAssertions();
    expect(getFileSize(distRunnerFile)).toMatchInlineSnapshot(`"runner.js: 0.57 KB (581 bytes)"`);
  });
});
