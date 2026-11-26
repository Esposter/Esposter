import type { GeneratedFileCheck } from "#src/models/precheck/GeneratedFileCheck";

import { PRECHECK_FIX_FINDING } from "#src/services/precheck/constants";
import { getStaleRowSuccessors } from "#src/services/precheck/getStaleRowSuccessors";
import { rewriteLedgerRows } from "#src/services/precheck/rewriteLedgerRows";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { readLedgerUnits } from "#src/services/sweeps/ledgerCoverage/readLedgerUnits";

// Each row a derived ledger's file holds for a unit its listing no longer derives. Such a file keeps only the units it
// Has something to say about, so a row the tree has lost is a note about nothing. `readText` returns a ledger's text by
// Its name, "" for a ledger with no file, and `unitsByLedger` derives each ledger's units, so the land fails on the
// Same rows CI's precheck test reads rather than on the push. A ledger with no rows has nothing to compare, so its
// Units are not derived, which is most of the question-by-area files. A row whose unit was reworded names the one unit
// It became, and `writeText`, given under `--fix`, takes the ledger's text with each such row naming it
export const checkLedgerRows = (
  readText: (ledger: string) => string,
  unitsByLedger: Record<string, () => string[]>,
  writeText?: (ledger: string, text: string) => void,
): GeneratedFileCheck => {
  const findings: string[] = [];
  const regenerated: string[] = [];
  let isFixable = false;
  for (const [ledger, getUnits] of Object.entries(unitsByLedger)) {
    const text = readText(ledger);
    const rowUnits = readLedgerUnits(text);
    if (rowUnits.length === 0) continue;

    const label = `${LEDGER_DIRECTORY}/${ledger}.md`;
    const successors = new Map<string, string>();
    for (const [unit, successor] of getStaleRowSuccessors(rowUnits, getUnits()))
      if (successor === undefined)
        findings.push(`stale row ${unit} in ${label}: no unit the tree derives, so remove it`);
      else successors.set(unit, successor);
    if (successors.size === 0) continue;
    if (writeText === undefined) {
      findings.push(
        ...Array.from(successors, ([unit, successor]) => `stale row ${unit} in ${label}: now ${successor}`),
      );
      isFixable = true;
    } else {
      writeText(ledger, rewriteLedgerRows(text, successors));
      regenerated.push(label);
    }
  }
  return { findings: isFixable ? [...findings, PRECHECK_FIX_FINDING] : findings, regenerated };
};
