import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import {
  DUPLICATE_CODE_FORMATS,
  DUPLICATE_CODE_IGNORED_GLOBS,
  MIN_DUPLICATE_LINES,
  MIN_DUPLICATE_TOKENS,
} from "#src/services/sweeps/duplicateCode/constants";
import { readDuplicateCodeFindings } from "#src/services/sweeps/duplicateCode/readDuplicateCodeFindings";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { jsonDateParse } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * The duplicate-code scan of every scope, read in one pass, finds no clone anywhere, so a copy the sweep would report
 * fails here, and CI's Duplicate Code job runs this file as its gate (`.agents/ledgers/quality/duplicate-code.md`)
 */
describe(readDuplicateCodeFindings, () => {
  test("finds no clone in the scan", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    expect(readDuplicateCodeFindings()).toStrictEqual([]);
  });
});

/**
 * The jscpd CLI reads `.jscpd.json` from the repository root, so a run outside the finder reads the finder's formats,
 * globs and minimums, held equal to its constants here so neither can drift from the other
 */
describe("duplicateCode", () => {
  test("reads the finder's formats, globs and minimums from its config", () => {
    expect.hasAssertions();

    expect(jsonDateParse(readFileSync(join(REPOSITORY_ROOT, ".jscpd.json"), "utf8"))).toStrictEqual({
      format: DUPLICATE_CODE_FORMATS,
      gitignore: false,
      ignore: DUPLICATE_CODE_IGNORED_GLOBS,
      minLines: MIN_DUPLICATE_LINES,
      minTokens: MIN_DUPLICATE_TOKENS,
      reporters: ["console"],
      threshold: 0,
    });
  });
});
