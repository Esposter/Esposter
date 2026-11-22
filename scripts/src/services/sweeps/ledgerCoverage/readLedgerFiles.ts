import type { LedgerFile } from "#src/models/sweeps/ledgerCoverage/LedgerFile";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_AREA_DIRECTORY, LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Every ledger file in the working tree, named by its path under the ledger directory, the area list aside, since its
// Files are the units the area-split ledgers share rather than ledgers of their own. A folder of area files is read
// File by file, so `write-once/products` is the ledger a trailer names for `write-once/products.md`
export const readLedgerFiles = (): LedgerFile[] =>
  readSweepFilePaths(`${LEDGER_DIRECTORY}/*.md`)
    .filter((ledgerPath) => !ledgerPath.endsWith("README.md") && !ledgerPath.startsWith(`${LEDGER_AREA_DIRECTORY}/`))
    .map((ledgerPath) => ({
      ledger: ledgerPath.slice(LEDGER_DIRECTORY.length + 1, -".md".length),
      ledgerPath,
      text: readFileSync(resolve(REPOSITORY_ROOT, ledgerPath), "utf8"),
    }));
