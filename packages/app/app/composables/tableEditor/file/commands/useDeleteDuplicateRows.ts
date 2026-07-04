import { DeleteRowsCommand } from "@/models/tableEditor/file/commands/DeleteRowsCommand";
import { KeepDuplicateMode } from "@/models/tableEditor/file/commands/KeepDuplicateMode";
import { findDuplicateRows } from "@/services/tableEditor/file/commands/findDuplicateRows";

export const useDeleteDuplicateRows = () =>
  useTableEditorCommand((editedItem, keepMode: KeepDuplicateMode = KeepDuplicateMode.First) => {
    const duplicateRows = findDuplicateRows(editedItem.dataSource, keepMode);
    if (duplicateRows.length === 0) return undefined;
    return new DeleteRowsCommand(duplicateRows);
  });
