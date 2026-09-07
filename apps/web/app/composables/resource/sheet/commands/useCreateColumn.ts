import type { Column } from "#shared/models/resource/sheet/column/Column";

import { ColumnTypeCommandMap } from "@/services/resource/sheet/column/ColumnTypeCommandMap";

export const useCreateColumn = () =>
  useSheetCommand((dataSource, newColumn: Column) => {
    const { id: _id, ...newColumnWithoutId } = newColumn;
    const columnIndex = dataSource.columns.length;
    return ColumnTypeCommandMap[newColumnWithoutId.type](columnIndex, newColumnWithoutId as never);
  });
