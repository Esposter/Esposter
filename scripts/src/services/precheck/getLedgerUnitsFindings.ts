import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { normalizeLedgerUnit } from "#src/services/sweeps/ledgerCoverage/normalizeLedgerUnit";
import { readLedgerUnits } from "#src/services/sweeps/ledgerCoverage/readLedgerUnits";

// Each row a derived ledger's file holds for a unit its listing no longer derives. Such a file keeps only the units it
// Has something to say about, so a row the tree has lost is a note about nothing. `readText` returns a ledger's text by
// Its name, "" for a ledger with no file, and `unitsByLedger` derives each ledger's units, so the land fails on the
// Same rows CI's ledgerUnits test reads rather than on the push
export const getLedgerUnitsFindings = (
  readText: (ledger: string) => string,
  unitsByLedger: Record<string, () => string[]>,
): string[] =>
  Object.entries(unitsByLedger).flatMap(([ledger, getUnits]) => {
    const derivedUnits = new Set(getUnits().map((unit) => normalizeLedgerUnit(unit)));
    return readLedgerUnits(readText(ledger))
      .filter((unit) => !derivedUnits.has(normalizeLedgerUnit(unit)))
      .map((unit) => `stale row ${unit} in ${LEDGER_DIRECTORY}/${ledger}.md: no unit the tree derives, so remove it`);
  });
