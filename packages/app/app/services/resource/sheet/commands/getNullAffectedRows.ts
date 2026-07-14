import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { IndexedRow } from "@/models/resource/sheet/commands/IndexedRow";

import { takeOne } from "@esposter/shared";

export const getNullAffectedRows = (dataSource: DataSource): IndexedRow[] => {
  const visibleColumns = dataSource.columns.filter((column) => !column.hidden);
  const result: IndexedRow[] = [];
  for (const [index, row] of dataSource.rows.entries()) {
    const hasNullOrEmpty = visibleColumns.some((column) => {
      const value = takeOne(row.data, column.name);
      return value === null || value === "";
    });
    if (hasNullOrEmpty) result.push({ index, row });
  }
  return result;
};
