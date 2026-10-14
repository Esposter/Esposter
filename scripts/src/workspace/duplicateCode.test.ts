import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import {
  DUPLICATE_CODE_FORMATS,
  DUPLICATE_CODE_IGNORED_GLOBS,
  DUPLICATE_CODE_SCOPES,
  MIN_DUPLICATE_LINES,
  MIN_DUPLICATE_TOKENS,
} from "#src/services/sweeps/duplicateCode/constants";
import { readDuplicateCodeFindings } from "#src/services/sweeps/duplicateCode/readDuplicateCodeFindings";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * The duplicate-code scan of every scope, read in one pass, finds no clone anywhere, so a copy the sweep would report
 * fails here (`.agents/ledgers/quality/duplicate-code.md`)
 */
describe(readDuplicateCodeFindings, () => {
  test("finds no clone in the scan", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    expect(readDuplicateCodeFindings()).toStrictEqual([]);
  });
});

/**
 * The jscpd gate in CI scans what the finder scans, with the finder's globs and minimums, so a clone the gate fails on
 * is one the sweep reports. Two copies of the same settings, held equal here, so neither can drift from the other
 */
describe("duplicateCode", () => {
  test("reads the finder's formats, globs and minimums from its config", () => {
    expect.hasAssertions();

    expect(JSON.parse(readFileSync(join(REPOSITORY_ROOT, ".jscpd.json"), "utf8"))).toStrictEqual({
      format: DUPLICATE_CODE_FORMATS,
      gitignore: false,
      ignore: DUPLICATE_CODE_IGNORED_GLOBS,
      minLines: MIN_DUPLICATE_LINES,
      minTokens: MIN_DUPLICATE_TOKENS,
      reporters: ["console"],
      threshold: 0,
    });
  });

  test("scans the finder's scopes", () => {
    expect.hasAssertions();

    const workflowLines = readFileSync(join(REPOSITORY_ROOT, ".github/workflows/CI.yaml"), "utf8")
      .split("\n")
      .map((line) => line.trim());

    expect(workflowLines).toContain(`path: ${DUPLICATE_CODE_SCOPES.join(" ")}`);
  });
});
