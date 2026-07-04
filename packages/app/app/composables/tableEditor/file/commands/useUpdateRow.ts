import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { UpdateRowCommand } from "@/models/tableEditor/file/commands/UpdateRowCommand";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useUpdateRow = () =>
  useTableEditorCommand((editedItem, updatedRow: Row) => {
    const index = editedItem.dataSource.rows.findIndex((row) => row.id === updatedRow.id);
    if (index === -1) return undefined;
    const originalRow = structuredClone(toRawDeep(takeOne(editedItem.dataSource.rows, index)));
    return new UpdateRowCommand(index, originalRow, structuredClone(toRawDeep(updatedRow)));
  });
