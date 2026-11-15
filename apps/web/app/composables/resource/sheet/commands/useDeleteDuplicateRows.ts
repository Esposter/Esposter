import { DeleteRowsCommand } from "#src/models/resource/sheet/commands/DeleteRowsCommand";
import { KeepDuplicateMode } from "#src/models/resource/sheet/commands/KeepDuplicateMode";
import { findDuplicateRows } from "#src/services/resource/sheet/commands/findDuplicateRows";

export const useDeleteDuplicateRows = () =>
  useSheetCommand((dataSource, keepMode: KeepDuplicateMode = KeepDuplicateMode.First) => {
    const duplicateRows = findDuplicateRows(dataSource, keepMode);
    if (duplicateRows.length === 0) return undefined;
    else return new DeleteRowsCommand(duplicateRows);
  });
