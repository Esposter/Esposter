import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_AREA_DIRECTORY } from "#src/services/sweeps/constants";
import { readLedgerAreas } from "#src/services/sweeps/ledgerCoverage/readLedgerAreas";
import { readLedgerUnits } from "#src/services/sweeps/ledgerCoverage/readLedgerUnits";
import { readOpenspecFolderUnits } from "#src/services/sweeps/ledgerCoverage/readOpenspecFolderUnits";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The one partition of the repository's tracked files: every unit of the area list, then the openspec folders, which
// The area list does not name. Units are disjoint, so each tracked file sits in exactly one of them
export const readPartitionUnits = (): string[] => [
  ...readLedgerAreas().flatMap((area) =>
    readLedgerUnits(readFileSync(join(REPOSITORY_ROOT, LEDGER_AREA_DIRECTORY, `${area}.md`), "utf8")),
  ),
  ...readOpenspecFolderUnits(),
];
