import type { IndexedColumn } from "@/models/resource/sheet/commands/IndexedColumn";

import { DeleteColumnsCommand } from "@/models/resource/sheet/commands/DeleteColumnsCommand";
import { getOriginalRowValues } from "@/services/resource/sheet/getOriginalRowValues";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useDeleteColumns = () =>
  useSheetCommand((dataSource, ids: string[]) => {
    const indexedColumns: IndexedColumn[] = [];
    for (const id of ids) {
      const columnIndex = dataSource.columns.findIndex((column) => column.id === id);
      if (columnIndex === -1) continue;
      const originalColumn = structuredClone(toRawDeep(takeOne(dataSource.columns, columnIndex)));
      const originalRowValues = getOriginalRowValues(dataSource, originalColumn.name);
      indexedColumns.push({ columnIndex, originalColumn, originalRowValues });
    }
    if (indexedColumns.length === 0) return undefined;
    return new DeleteColumnsCommand(indexedColumns);
  });
