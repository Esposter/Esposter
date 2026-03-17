import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { AffectedCell } from "@/models/tableEditor/file/commands/AffectedCell";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { takeOne } from "@esposter/shared";

export const getStringColumnsAffectedCells = (dataSource: DataSource): AffectedCell[] => {
  const visibleStringColumns = dataSource.columns.filter(
    (column) => !column.hidden && column.type === ColumnType.String,
  );
  const result: AffectedCell[] = [];
  for (const [rowIndex, row] of dataSource.rows.entries())
    for (const column of visibleStringColumns) {
      const cellValue = takeOne(row.data, column.name);
      if (cellValue === null) continue;
      result.push({ columnName: column.name, originalValue: cellValue, rowIndex });
    }

  return result;
};
