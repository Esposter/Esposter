import { getLedgerUnitsFindings } from "#src/services/precheck/getLedgerUnitsFindings";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { LedgerUnitsMap } from "#src/services/sweeps/ledgerCoverage/LedgerUnitsMap";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Every derived ledger's rows against the tree in this checkout, read as the working tree holds them
export const checkLedgerUnits = (): string[] =>
  getLedgerUnitsFindings((ledger) => {
    const path = join(REPOSITORY_ROOT, LEDGER_DIRECTORY, `${ledger}.md`);
    return existsSync(path) ? readFileSync(path, "utf8") : "";
  }, LedgerUnitsMap);
