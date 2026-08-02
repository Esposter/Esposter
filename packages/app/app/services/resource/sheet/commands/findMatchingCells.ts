import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { AffectedCell } from "@/models/resource/sheet/commands/AffectedCell";

import { getVisibleColumns } from "@/services/resource/sheet/column/getVisibleColumns";
import { takeOne } from "@esposter/shared";

export const findMatchingCells = (
  dataSource: DataSource,
  findValue: string,
  specificCell?: { columnName: string; rowIndex: number },
): AffectedCell[] => {
  const { rows } = dataSource;
  const visibleColumns = specificCell
    ? getVisibleColumns(dataSource.columns).filter((column) => column.name === specificCell.columnName)
    : getVisibleColumns(dataSource.columns);
  const result: AffectedCell[] = [];
  const rowStart = specificCell ? specificCell.rowIndex : 0;
  const rowEnd = specificCell ? specificCell.rowIndex + 1 : rows.length;
  for (const [index, row] of rows.slice(rowStart, rowEnd).entries()) {
    const rowIndex = rowStart + index;
    for (const column of visibleColumns) {
      const cellValue = takeOne(row.data, column.name);
      if (cellValue === null) continue;
      const cellString = String(cellValue);
      if (cellString.includes(findValue)) result.push({ columnName: column.name, originalValue: cellValue, rowIndex });
    }
  }
  return result;
};
