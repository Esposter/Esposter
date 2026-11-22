import type { LedgerFile } from "#src/models/sweeps/ledgerCoverage/LedgerFile";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_AREA_DIRECTORY, LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { getLedgerQuestion } from "#src/services/sweeps/ledgerCoverage/getLedgerQuestion";
import { readLedgerAreas } from "#src/services/sweeps/ledgerCoverage/readLedgerAreas";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Every ledger file in the working tree that is a ledger of its own, named by its path under the ledger directory. The
// Area list is the units the questions share rather than a ledger, and a `<question>/<area>.md` file holds only that
// Question's notes, so neither is read here
export const readLedgerFiles = (): LedgerFile[] => {
  const areas = readLedgerAreas();
  return readSweepFilePaths(`${LEDGER_DIRECTORY}/*.md`)
    .filter((ledgerPath) => !ledgerPath.endsWith("README.md") && !ledgerPath.startsWith(`${LEDGER_AREA_DIRECTORY}/`))
    .map((ledgerPath) => ({ ledger: ledgerPath.slice(LEDGER_DIRECTORY.length + 1, -".md".length), ledgerPath }))
    .filter(({ ledger }) => getLedgerQuestion(ledger, areas) === ledger)
    .map(({ ledger, ledgerPath }) => ({
      ledger,
      ledgerPath,
      text: readFileSync(resolve(REPOSITORY_ROOT, ledgerPath), "utf8"),
    }));
};
