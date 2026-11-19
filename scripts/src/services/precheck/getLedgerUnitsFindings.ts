import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { syncLedgerUnits } from "#src/services/sweeps/ledgerCoverage/syncLedgerUnits";

// Each derived ledger whose rows `syncLedgerUnits` would change: a unit the tree derives that the table lacks, or a row
// Whose unit the tree has lost. `readText` returns a ledger's text by its name, and `unitsByLedger` derives each
// Ledger's units, so the check reads the tree CI's ledgerUnits test reads and fails before the push rather than on it
export const getLedgerUnitsFindings = (
  readText: (ledger: string) => string,
  unitsByLedger: Record<string, () => string[]>,
): string[] => {
  const unsyncedPaths = Object.entries(unitsByLedger).flatMap(([ledger, getUnits]) => {
    const text = readText(ledger);
    return syncLedgerUnits(text, getUnits()) === text ? [] : [`${LEDGER_DIRECTORY}/${ledger}.md`];
  });
  if (unsyncedPaths.length === 0) return [];

  return [...unsyncedPaths.map((path) => `out of sync ${path}`), "fix: pnpm ai:sweep:ledger-coverage"];
};
