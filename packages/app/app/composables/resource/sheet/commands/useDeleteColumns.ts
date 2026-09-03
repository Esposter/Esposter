import type { IndexedColumn } from "@/models/resource/sheet/commands/IndexedColumn";

import { DeleteColumnsCommand } from "@/models/resource/sheet/commands/DeleteColumnsCommand";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useDeleteColumns = () =>
  useSheetCommand((dataSource, ids: string[]) => {
    const columnIdIndexMap = new Map(dataSource.columns.map((column, index) => [column.id, index]));
    const indexedColumns: IndexedColumn[] = [];
    for (const id of ids) {
      const columnIndex = columnIdIndexMap.get(id);
      if (columnIndex === undefined) continue;
      const originalColumn = structuredClone(toRawDeep(takeOne(dataSource.columns, columnIndex)));
      indexedColumns.push({ columnIndex, originalColumn, originalRowValues: [] });
    }
    if (indexedColumns.length === 0) return undefined;
    // Every target column's values are collected in one pass, so each row is unwrapped once
    for (const row of dataSource.rows) {
      const { data } = toRawDeep(row);
      for (const { originalColumn, originalRowValues } of indexedColumns)
        originalRowValues.push(takeOne(data, originalColumn.name));
    }
    return new DeleteColumnsCommand(indexedColumns);
  });
