import { readDuplicateCodeFindings } from "#src/services/sweeps/duplicateCode/readDuplicateCodeFindings";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { describe, expect, test } from "vitest";

/**
 * The duplicate-code scan of every scope, read in one pass, finds no clone anywhere, so a copy the sweep would report
 * fails here, and the coverage shards that run the scripts suite are its gate (`.agents/ledgers/quality/duplicate-code.md`)
 */
describe(readDuplicateCodeFindings, () => {
  test("finds no clone in the scan", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    expect(readDuplicateCodeFindings()).toStrictEqual([]);
  });
});
