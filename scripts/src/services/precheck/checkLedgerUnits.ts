import { getLedgerUnitsFindings } from "#src/services/precheck/getLedgerUnitsFindings";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { LedgerUnitsMap } from "#src/services/sweeps/ledgerCoverage/LedgerUnitsMap";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Every derived ledger's rows against the tree in this checkout, read as the working tree holds them. A row the tree
// Derives and the table lacks is what `ai:sweep:ledger-coverage` writes in, so the land names that command rather than
// Writing it into a commit the author did not make
export const checkLedgerUnits = (): string[] =>
  getLedgerUnitsFindings(
    (ledger) => readFileSync(join(REPOSITORY_ROOT, LEDGER_DIRECTORY, `${ledger}.md`), "utf8"),
    LedgerUnitsMap,
  );
