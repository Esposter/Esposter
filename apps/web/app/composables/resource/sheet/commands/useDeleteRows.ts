import type { IndexedRow } from "#src/models/resource/sheet/commands/IndexedRow";

import { cloneRow } from "#shared/services/resource/sheet/commands/cloneRow";
import { DeleteRowsCommand } from "#src/models/resource/sheet/commands/DeleteRowsCommand";
import { takeOne } from "@esposter/shared";

export const useDeleteRows = () =>
  useSheetCommand((dataSource, ids: string[]) => {
    const rowIdIndexMap = new Map(dataSource.rows.map((row, index) => [row.id, index]));
    const indexedRows: IndexedRow[] = [];
    for (const id of ids) {
      const index = rowIdIndexMap.get(id);
      if (index === undefined) continue;
      indexedRows.push({ index, row: cloneRow(takeOne(dataSource.rows, index)) });
    }
    if (indexedRows.length === 0) return undefined;
    else return new DeleteRowsCommand(indexedRows);
  });
