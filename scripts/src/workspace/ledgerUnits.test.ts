import { checkLedgerUnits } from "#src/services/precheck/checkLedgerUnits";
import { describe, expect, test } from "vitest";

/**
 * A derived ledger's units are the tree's, and its file keeps only the units it has something to say about, so a row
 * whose unit the tree has lost is a note about nothing, which this reports before a status reads past it. An area unit
 * naming a path the tree no longer holds is reported the same way, since every question's cells are read from the list.
 */
describe("ledgerUnits", () => {
  test("every notes row names a unit the tree derives, and every area unit names a path the tree holds", () => {
    expect.hasAssertions();

    expect(checkLedgerUnits()).toStrictEqual([]);
  });
});
