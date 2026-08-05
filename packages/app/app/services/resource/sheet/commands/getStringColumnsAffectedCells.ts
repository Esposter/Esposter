import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { AffectedCell } from "@/models/resource/sheet/commands/AffectedCell";

import { getVisibleStringColumns } from "@/services/resource/sheet/column/getVisibleStringColumns";
import { takeOne } from "@esposter/shared";

export const getStringColumnsAffectedCells = (dataSource: DataSource): AffectedCell[] => {
  const visibleStringColumns = getVisibleStringColumns(dataSource.columns);
  const result: AffectedCell[] = [];
  for (const [rowIndex, row] of dataSource.rows.entries())
    for (const column of visibleStringColumns) {
      const cellValue = takeOne(row.data, column.name);
      if (cellValue === null) continue;
      result.push({ columnName: column.name, originalValue: cellValue, rowIndex });
    }

  return result;
};
