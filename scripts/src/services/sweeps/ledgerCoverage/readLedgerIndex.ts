import type { LedgerIndexRow } from "#src/models/sweeps/ledgerCoverage/LedgerIndexRow";

import { getBacktickedTokens } from "#src/services/citations/getBacktickedTokens";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const INDEX_ROW_REGEX = /^\| \[(?<ledger>[^\]]+)\]\([^)]+\)\s*\|[^|]*\|[^|]*\|(?<scope>[^|]*)\|$/u;

// Every row of the ledgers index, its `Scope` cell read as the git pathspecs the cell backticks. A line that is not a
// Row is skipped, and the workspace suite holds the rows to the ledger directory, so a mangled row fails there
export const readLedgerIndex = (): LedgerIndexRow[] =>
  readFileSync(join(REPOSITORY_ROOT, LEDGER_DIRECTORY, "README.md"), "utf8")
    .split("\n")
    .flatMap((line) => {
      const groups = INDEX_ROW_REGEX.exec(line)?.groups;
      if (groups === undefined) return [];

      return [{ ledger: groups.ledger ?? "", pathspecs: getBacktickedTokens(groups.scope ?? "") }];
    });
