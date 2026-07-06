import type { Column } from "#shared/models/tableEditor/file/column/Column";

import { ColumnTypeCommandMap } from "@/services/tableEditor/file/column/ColumnTypeCommandMap";

export const useCreateColumn = () =>
  useTableEditorCommand((editedItem, newColumn: Column) => {
    const { id: _id, ...newColumnWithoutId } = newColumn;
    const columnIndex = editedItem.dataSource.columns.length;
    return ColumnTypeCommandMap[newColumnWithoutId.type](columnIndex, newColumnWithoutId as never);
  });
