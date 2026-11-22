import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_AREA_DIRECTORY } from "#src/services/sweeps/constants";
import { readLedgerAreas } from "#src/services/sweeps/ledgerCoverage/readLedgerAreas";
import { readOpenspecFolderUnits } from "#src/services/sweeps/ledgerCoverage/readOpenspecFolderUnits";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const UNIT_BULLET_REGEX = /^- (?<unit>.+)$/u;

// One `- <cell>` bullet per unit, the cell as written. The title and the preamble are prose, so no other line is a unit
export const readAreaUnits = (text: string): string[] =>
  text.split("\n").flatMap((line) => {
    const unit = UNIT_BULLET_REGEX.exec(line)?.groups?.unit;
    return unit === undefined ? [] : [unit.trim()];
  });

// The partition of the tracked files: the area list's units, then the openspec folder units the area list does not name
export const readPartitionUnits = (): string[] => [
  ...readLedgerAreas().flatMap((area) =>
    readAreaUnits(readFileSync(join(REPOSITORY_ROOT, LEDGER_AREA_DIRECTORY, `${area}.md`), "utf8")),
  ),
  ...readOpenspecFolderUnits(),
];
