import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { IndexedRow } from "@/models/resource/sheet/commands/IndexedRow";

import { getVisibleColumns } from "@/services/resource/sheet/column/getVisibleColumns";
import { checkIsNullOrEmptyValue } from "@/services/resource/sheet/commands/checkIsNullOrEmptyValue";
import { takeOne } from "@esposter/shared";

export const getNullAffectedRows = (dataSource: DataSource): IndexedRow[] => {
  const visibleColumns = getVisibleColumns(dataSource.columns);
  const affectedRows: IndexedRow[] = [];
  for (const [index, row] of dataSource.rows.entries())
    if (visibleColumns.some((column) => checkIsNullOrEmptyValue(takeOne(row.data, column.name))))
      affectedRows.push({ index, row });
  return affectedRows;
};
