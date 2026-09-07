import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { AffectedCell } from "@/models/resource/sheet/commands/AffectedCell";

import { takeOne } from "@esposter/shared";

// The one row × column walk every cell-scoped command shares; each caller supplies the column set it
// Acts on and the predicate deciding whether a cell is affected. rowRange bounds are inclusive
export const collectAffectedCells = (
  rows: Row[],
  columns: Column[],
  checkIsAffected: (value: ColumnValue) => boolean,
  rowRange?: { end: number; start: number },
): AffectedCell[] => {
  const affectedCells: AffectedCell[] = [];
  for (const [rowIndex, row] of rows.entries()) {
    if (rowRange && rowIndex < rowRange.start) continue;
    else if (rowRange && rowIndex > rowRange.end) break;

    for (const column of columns) {
      const value = takeOne(row.data, column.name);
      if (checkIsAffected(value)) affectedCells.push({ columnName: column.name, originalValue: value, rowIndex });
    }
  }
  return affectedCells;
};
