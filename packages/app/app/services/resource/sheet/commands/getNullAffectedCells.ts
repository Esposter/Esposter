import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { AffectedCell } from "@/models/resource/sheet/commands/AffectedCell";

import { getVisibleStringColumns } from "@/services/resource/sheet/column/getVisibleStringColumns";
import { takeOne } from "@esposter/shared";

export const getNullAffectedCells = (dataSource: DataSource): AffectedCell[] => {
  const visibleStringColumns = getVisibleStringColumns(dataSource.columns);
  const result: AffectedCell[] = [];
  for (const [rowIndex, row] of dataSource.rows.entries())
    for (const column of visibleStringColumns) {
      const value = takeOne(row.data, column.name);
      if (value !== null && value !== "") continue;
      result.push({ columnName: column.name, originalValue: value, rowIndex });
    }
  return result;
};
