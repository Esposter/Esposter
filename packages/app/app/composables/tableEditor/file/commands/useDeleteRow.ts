import { DeleteRowCommand } from "@/models/tableEditor/file/commands/DeleteRowCommand";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useDeleteRow = () =>
  useTableEditorCommand((editedItem, id: string) => {
    const index = editedItem.dataSource.rows.findIndex((row) => row.id === id);
    if (index === -1) return undefined;
    const originalRow = structuredClone(toRawDeep(takeOne(editedItem.dataSource.rows, index)));
    return new DeleteRowCommand(index, originalRow);
  });
