import type { Row } from "#shared/models/resource/file/datasource/Row";

import { UpdateRowCommand } from "@/models/resource/file/commands/UpdateRowCommand";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useUpdateRow = () =>
  useFileCommand((dataSource, updatedRow: Row) => {
    const index = dataSource.rows.findIndex((row) => row.id === updatedRow.id);
    if (index === -1) return undefined;
    const originalRow = structuredClone(toRawDeep(takeOne(dataSource.rows, index)));
    return new UpdateRowCommand(index, originalRow, structuredClone(toRawDeep(updatedRow)));
  });
