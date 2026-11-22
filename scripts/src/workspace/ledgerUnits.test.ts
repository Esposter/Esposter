import { checkLedgerUnits } from "#src/services/precheck/checkLedgerUnits";
import { describe, expect, test } from "vitest";

/**
 * A derived ledger's units are the tree's, and its file keeps only the units it has something to say about, so a row
 * whose unit the tree has lost is a note about nothing, which this reports before a status reads past it.
 */
describe("ledgerUnits", () => {
  test("every derived ledger's rows name units the tree derives", () => {
    expect.hasAssertions();

    expect(checkLedgerUnits()).toStrictEqual([]);
  });
});
