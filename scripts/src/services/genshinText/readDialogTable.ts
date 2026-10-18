import type { DumpedDialog } from "#src/models/genshinText/DumpedDialog";

import { DIALOG_TABLE_NAME, SCRAMBLED_KEY_REGEX } from "#src/services/genshinText/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The dialog table's rows, with the field each row's scrambled id is kept under, the one key the dump names by eleven capitals
export const readDialogTable = (): { dialogRows: (DumpedDialog & Record<string, unknown>)[]; idKey: string } => {
  const dialogRows = readExcelTable<DumpedDialog & Record<string, unknown>>(DIALOG_TABLE_NAME);
  const idKey = Object.keys(dialogRows[0] ?? {}).find((key) => SCRAMBLED_KEY_REGEX.test(key));
  if (!idKey) throw new InvalidOperationError(Operation.Read, DIALOG_TABLE_NAME, "has no scrambled id field");
  return { dialogRows, idKey };
};
