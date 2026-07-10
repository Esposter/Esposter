import type { Column } from "#shared/models/resource/file/column/Column";

import { ColumnTypeCommandMap } from "@/services/resource/file/column/ColumnTypeCommandMap";

export const useCreateColumn = () =>
  useFileCommand((dataSource, newColumn: Column) => {
    const { id: _id, ...newColumnWithoutId } = newColumn;
    const columnIndex = dataSource.columns.length;
    return ColumnTypeCommandMap[newColumnWithoutId.type](columnIndex, newColumnWithoutId as never);
  });
