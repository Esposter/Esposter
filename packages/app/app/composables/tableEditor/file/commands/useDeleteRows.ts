import type { IndexedRow } from "@/models/tableEditor/file/commands/IndexedRow";

import { DeleteRowsCommand } from "@/models/tableEditor/file/commands/DeleteRowsCommand";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useDeleteRows = () =>
  useTableEditorCommand((editedItem, ids: string[]) => {
    const dataSource = editedItem.dataSource;
    const indexedRows: IndexedRow[] = [];
    for (const id of ids) {
      const index = dataSource.rows.findIndex((row) => row.id === id);
      if (index === -1) continue;
      indexedRows.push({ index, row: structuredClone(toRawDeep(takeOne(dataSource.rows, index))) });
    }
    if (indexedRows.length === 0) return undefined;
    return new DeleteRowsCommand(indexedRows);
  });
