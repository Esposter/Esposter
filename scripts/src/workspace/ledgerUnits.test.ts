import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { LedgerUnitsMap } from "#src/services/sweeps/ledgerCoverage/LedgerUnitsMap";
import { syncLedgerUnits } from "#src/services/sweeps/ledgerCoverage/syncLedgerUnits";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A derived ledger's rows are the tree's, written by `pnpm ai:sweep:ledger-coverage` — so a skill added without
 * a row, or a row outliving its skill, is a run nobody made, and this is what reports it before a resume reads a
 * table that no longer matches the tree it covers.
 */
describe("ledgerUnits", () => {
  test.each(Object.entries(LedgerUnitsMap))("%s holds one row per unit the tree derives", (ledger, getUnits) => {
    expect.hasAssertions();

    const text = readFileSync(join(REPOSITORY_ROOT, LEDGER_DIRECTORY, `${ledger}.md`), "utf8");

    expect(syncLedgerUnits(text, getUnits())).toBe(text);
  });
});
