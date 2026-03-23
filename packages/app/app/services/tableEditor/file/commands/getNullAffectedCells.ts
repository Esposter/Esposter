import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { AffectedCell } from "@/models/tableEditor/file/commands/AffectedCell";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { takeOne } from "@esposter/shared";

export const getNullAffectedCells = (dataSource: DataSource): AffectedCell[] => {
  const visibleStringColumns = dataSource.columns.filter(
    (column) => !column.hidden && column.type === ColumnType.String,
  );
  const result: AffectedCell[] = [];
  for (const [rowIndex, row] of dataSource.rows.entries())
    for (const column of visibleStringColumns) {
      const value = takeOne(row.data, column.name);
      if (value !== null && value !== "") continue;
      result.push({ columnName: column.name, originalValue: value, rowIndex });
    }
  return result;
};
