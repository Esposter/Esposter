import { DeleteRowsCommand } from "@/models/resource/sheet/commands/DeleteRowsCommand";
import { KeepDuplicateMode } from "@/models/resource/sheet/commands/KeepDuplicateMode";
import { findDuplicateRows } from "@/services/resource/sheet/commands/findDuplicateRows";

export const useDeleteDuplicateRows = () =>
  useSheetCommand((dataSource, keepMode: KeepDuplicateMode = KeepDuplicateMode.First) => {
    const duplicateRows = findDuplicateRows(dataSource, keepMode);
    if (duplicateRows.length === 0) return undefined;
    return new DeleteRowsCommand(duplicateRows);
  });
