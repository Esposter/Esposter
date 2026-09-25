import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { AffectedCell } from "@/models/resource/sheet/commands/AffectedCell";

import { checkIsEditableColumnValue } from "@/services/resource/sheet/column/checkIsEditableColumnValue";
import { takeOne } from "@esposter/shared";

// The one row × column walk every cell-scoped command shares; each caller supplies the column set it
// Acts on and the predicate deciding whether a cell is affected. rowRange bounds are inclusive. A computed column
// Is skipped whatever the caller hands in: its value is never stored, so `row.data` holds nothing a predicate can
// Judge — an absent cell stringifies to "undefined" and a find would match it — and nothing a command may write
export const collectAffectedCells = (
  rows: Row[],
  columns: Column[],
  checkIsAffected: (value: ColumnValue) => boolean,
  rowRange?: { end: number; start: number },
) => {
  const affectedCells: AffectedCell[] = [];
  for (const [rowIndex, row] of rows.entries())
    if (rowRange && rowIndex > rowRange.end) break;
    else if (!rowRange || rowIndex >= rowRange.start)
      for (const column of columns) {
        if (!checkIsEditableColumnValue(column)) continue;
        const value = takeOne(row.data, column.name);
        if (checkIsAffected(value)) affectedCells.push({ columnName: column.name, originalValue: value, rowIndex });
      }
  return affectedCells;
};
