import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { IndexedRow } from "@/models/resource/sheet/commands/IndexedRow";

import { checkIsEditableColumnValue } from "@/services/resource/sheet/column/checkIsEditableColumnValue";
import { getVisibleColumns } from "@/services/resource/sheet/column/getVisibleColumns";
import { checkIsNullOrEmptyValue } from "@/services/resource/sheet/commands/checkIsNullOrEmptyValue";
import { takeOne } from "@esposter/shared";

export const getNullAffectedRows = (dataSource: DataSource) => {
  // A computed column stores nothing, so a null under its name — left by an older row — is no empty cell of the row's
  const visibleColumns = getVisibleColumns(dataSource.columns).filter((column) => checkIsEditableColumnValue(column));
  const affectedRows: IndexedRow[] = [];
  for (const [index, row] of dataSource.rows.entries())
    if (visibleColumns.some((column) => checkIsNullOrEmptyValue(takeOne(row.data, column.name))))
      affectedRows.push({ index, row });
  return affectedRows;
};
