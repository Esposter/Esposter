import { readDuplicateCodeFindings } from "#src/services/sweeps/duplicateCode/readDuplicateCodeFindings";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { describe, expect, test } from "vitest";

/**
 * The duplicate-code sweep's zero, held over the whole scan: every unit of the ledger is swept to no finding, so the
 * scan finds none anywhere (`.agents/ledgers/quality/duplicate-code.md`)
 */
describe("duplicate code", () => {
  test("finds no clone in the scan", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    expect(readDuplicateCodeFindings()).toStrictEqual([]);
  });
});
