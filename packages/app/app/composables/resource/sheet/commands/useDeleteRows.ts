import type { IndexedRow } from "@/models/resource/sheet/commands/IndexedRow";

import { DeleteRowsCommand } from "@/models/resource/sheet/commands/DeleteRowsCommand";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useDeleteRows = () =>
  useSheetCommand((dataSource, ids: string[]) => {
    const rowIndexById = new Map(dataSource.rows.map((row, index) => [row.id, index]));
    const indexedRows: IndexedRow[] = [];
    for (const id of ids) {
      const index = rowIndexById.get(id);
      if (index === undefined) continue;
      indexedRows.push({ index, row: structuredClone(toRawDeep(takeOne(dataSource.rows, index))) });
    }
    if (indexedRows.length === 0) return undefined;
    return new DeleteRowsCommand(indexedRows);
  });
