import { EXCEL_DIRECTORY } from "#src/services/genshinText/constants";
import { fillDumpDefaults } from "#src/services/genshinText/fillDumpDefaults";
import { renameDumpKeys } from "#src/services/genshinText/renameDumpKeys";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// One of the dump's game tables by its name, its rows as the type names the fields read, with the fields the dump leaves
// Out at their default written back, so every reader of a table reads it the one way. A key map names each field under
// The key the dump holds it at, for a table whose keys are scrambled, and each row then reads under the decoded names
export const readExcelTable = <TRow>(name: string, keyMap?: Record<keyof TRow, string>): TRow[] => {
  const rows = parseMachineJson<Record<string, unknown>[]>(readFileSync(join(EXCEL_DIRECTORY, `${name}.json`), "utf8"));
  fillDumpDefaults(rows);
  return keyMap ? renameDumpKeys(rows, keyMap) : (rows as TRow[]);
};
