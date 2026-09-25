import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { AffectedCell } from "@/models/resource/sheet/commands/AffectedCell";

import { writeCellValue } from "@/services/resource/sheet/commands/writeCellValue";
import { takeOne } from "@esposter/shared";

// Every cell-level command executes and undoes the same way — a value per affected cell, with the column's size
// Moved by the difference — so the only thing a command states is which value a cell gets
export const writeAffectedCells = (
  dataSource: DataSource,
  affectedCells: AffectedCell[],
  getValue: (affectedCell: AffectedCell, column: Column) => ColumnValue,
) => {
  const columnMap = new Map(dataSource.columns.map((column) => [column.name, column]));
  for (const affectedCell of affectedCells) {
    const { columnName, rowIndex } = affectedCell;
    const row = takeOne(dataSource.rows, rowIndex);
    const column = columnMap.get(columnName);
    if (!column) continue;
    writeCellValue(row, column, getValue(affectedCell, column));
  }
};
