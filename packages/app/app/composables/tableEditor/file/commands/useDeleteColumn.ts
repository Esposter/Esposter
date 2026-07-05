import { DeleteColumnCommand } from "@/models/tableEditor/file/commands/DeleteColumnCommand";
import { getOriginalRowValues } from "@/services/tableEditor/file/getOriginalRowValues";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useDeleteColumn = () =>
  useTableEditorCommand((editedItem, name: string) => {
    const columnIndex = editedItem.dataSource.columns.findIndex((column) => column.name === name);
    if (columnIndex === -1) return undefined;
    const originalColumn = structuredClone(toRawDeep(takeOne(editedItem.dataSource.columns, columnIndex)));
    const originalRowValues = getOriginalRowValues(editedItem.dataSource, name);
    return new DeleteColumnCommand(columnIndex, originalColumn, originalRowValues);
  });
