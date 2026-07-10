import type { IndexedColumn } from "@/models/resource/file/commands/IndexedColumn";

import { DeleteColumnsCommand } from "@/models/resource/file/commands/DeleteColumnsCommand";
import { getOriginalRowValues } from "@/services/resource/file/getOriginalRowValues";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useDeleteColumns = () =>
  useFileCommand((dataSource, ids: string[]) => {
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
