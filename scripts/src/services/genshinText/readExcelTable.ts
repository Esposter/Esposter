import { EXCEL_DIRECTORY } from "#src/services/genshinText/constants";
import { fillDumpDefaults } from "#src/services/genshinText/fillDumpDefaults";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// One of the dump's game tables by its name, its rows as the type names the fields read, with the fields the dump leaves
// Out at their default written back, so every reader of a table reads it the one way
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- the caller names the row the table holds
export const readExcelTable = <TRow>(name: string): TRow[] => {
  const rows = parseMachineJson<TRow[]>(readFileSync(join(EXCEL_DIRECTORY, `${name}.json`), "utf8"));
  fillDumpDefaults(rows);
  return rows;
};
