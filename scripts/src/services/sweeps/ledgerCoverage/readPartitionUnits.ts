import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_AREA_DIRECTORY } from "#src/services/sweeps/constants";
import { OPENSPEC_AREA } from "#src/services/sweeps/ledgerCoverage/constants";
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

// The units one area file names
export const readAreaFileUnits = (area: string): string[] =>
  readAreaUnits(readFileSync(join(REPOSITORY_ROOT, LEDGER_AREA_DIRECTORY, `${area}.md`), "utf8"));

// The partition of the tracked files: the area list's units, then the openspec folder units the area list does not name
export const readPartitionUnits = (): string[] => [
  ...readLedgerAreas().flatMap((area) => readAreaFileUnits(area)),
  ...readOpenspecFolderUnits(),
];

// The area each unit of the partition sits in: the area file that names it, else the openspec area for a derived folder
export const readUnitAreas = (): Map<string, string> =>
  new Map([
    ...readOpenspecFolderUnits().map((unit): [string, string] => [unit, OPENSPEC_AREA]),
    ...readLedgerAreas().flatMap((area) => readAreaFileUnits(area).map((unit): [string, string] => [unit, area])),
  ]);
