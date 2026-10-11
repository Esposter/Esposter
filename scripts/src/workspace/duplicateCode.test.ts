import { readDuplicateCodeFindings } from "#src/services/sweeps/duplicateCode/readDuplicateCodeFindings";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { describe, expect, test } from "vitest";

/**
 * The duplicate-code sweep's zero, held over each unit it has brought to no finding: a clone with either side in one
 * of them fails, whatever the other side's unit. A unit joins as its ledger row is swept to none, until the scan finds
 * none anywhere and the scope is the whole of it (`.agents/ledgers/quality/duplicate-code.md`)
 */
describe("duplicate code", () => {
  const ZERO_UNITS = ["packages/genshin-world/"];

  test("finds no clone in a unit swept to none", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    expect(
      readDuplicateCodeFindings().filter(({ paths }) =>
        paths.some((path) => ZERO_UNITS.some((unit) => path.startsWith(unit))),
      ),
    ).toStrictEqual([]);
  });
});
