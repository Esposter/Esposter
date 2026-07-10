import { DeleteRowsCommand } from "@/models/resource/file/commands/DeleteRowsCommand";
import { KeepDuplicateMode } from "@/models/resource/file/commands/KeepDuplicateMode";
import { findDuplicateRows } from "@/services/resource/file/commands/findDuplicateRows";

export const useDeleteDuplicateRows = () =>
  useFileCommand((dataSource, keepMode: KeepDuplicateMode = KeepDuplicateMode.First) => {
    const duplicateRows = findDuplicateRows(dataSource, keepMode);
    if (duplicateRows.length === 0) return undefined;
    return new DeleteRowsCommand(duplicateRows);
  });
