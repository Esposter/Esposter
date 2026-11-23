import type { ExcelConstValueRow } from "#src/models/genshinAssets/shared/ExcelConstValueRow";

import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The values the game's constant table gives the constant named, in their order, each a string its reader parses. The
// Table's values sit under a scrambled key in the dump, so the key map names them
export const readConstValue = (name: string): string[] => {
  const row = readExcelTable<ExcelConstValueRow>("ConstValueExcelConfigData", {
    name: "name",
    values: "CBOMLBFIPJM",
  }).find((constValueRow) => constValueRow.name === name);
  if (!row) throw new InvalidOperationError(Operation.Read, name, "it is not in the game's constant table");
  return row.values;
};
