import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

import { UpdateRowCommand } from "#shared/models/resource/sheet/commands/UpdateRowCommand";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useUpdateRow = () =>
  useSheetCommand((dataSource, updatedRow: ToData<Row>) => {
    const index = dataSource.rows.findIndex((row) => row.id === updatedRow.id);
    if (index === -1) return undefined;
    const originalRow = structuredClone(toRawDeep(takeOne(dataSource.rows, index)));
    return new UpdateRowCommand(index, originalRow, structuredClone(toRawDeep(updatedRow)));
  });
