import type { LedgerFile } from "#src/models/sweeps/ledgerCoverage/LedgerFile";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Every ledger file in the working tree, named by its path under the ledger directory. A folder of area files is read
// File by file, so `write-once/products` is the ledger a trailer names for `write-once/products.md`
export const readLedgerFiles = (): LedgerFile[] =>
  readSweepFilePaths(`${LEDGER_DIRECTORY}/*.md`)
    .filter((ledgerPath) => !ledgerPath.endsWith("README.md"))
    .map((ledgerPath) => ({
      ledger: ledgerPath.slice(LEDGER_DIRECTORY.length + 1, -".md".length),
      ledgerPath,
      text: readFileSync(resolve(REPOSITORY_ROOT, ledgerPath), "utf8"),
    }));
