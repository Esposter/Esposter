import { EXCEL_DIRECTORY } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// One of the dump's game tables by its name, its rows as the type names the fields read
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- the caller names the row the table holds
export const readExcelTable = <TRow>(name: string): TRow[] =>
  parseMachineJson<TRow[]>(readFileSync(join(EXCEL_DIRECTORY, `${name}.json`), "utf8"));
