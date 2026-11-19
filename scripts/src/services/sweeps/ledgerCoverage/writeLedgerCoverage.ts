import type { LedgerCoverage } from "#src/models/sweeps/ledgerCoverage/LedgerCoverage";

import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

// The only write the coverage sweep makes: each ledger file the sync changed, and no other file.
// Checked before the first write, so a path outside the ledger directory fails the run with nothing written
export const writeLedgerCoverage = (files: LedgerCoverage["files"], root: string): string[] => {
  const changed = files.filter(({ rewrittenText, text }) => rewrittenText !== text);
  const outside = changed.find(({ ledgerPath }) => !ledgerPath.startsWith(`${LEDGER_DIRECTORY}/`));
  if (outside)
    throw new InvalidOperationError(
      Operation.Update,
      outside.ledgerPath,
      `the coverage sweep writes only files under ${LEDGER_DIRECTORY}`,
    );

  for (const { ledgerPath, rewrittenText } of changed) writeFileSync(resolve(root, ledgerPath), rewrittenText);
  return changed.map(({ ledgerPath }) => ledgerPath);
};
