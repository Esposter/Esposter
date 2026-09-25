import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { checkIsEditableColumnValue } from "@/services/resource/sheet/column/checkIsEditableColumnValue";
import { coerceValue } from "@/services/resource/sheet/column/coerceValue";
import { createEmptyRowData } from "@/services/resource/sheet/dataSource/createEmptyRowData";

// A new row made from one pasted line — the rows an overwriting paste appends past the end and the rows a shift-down
// Paste inserts are the same row. Each value lands in the target column at its offset, coerced to that column's type,
// And a computed column takes nothing: its value is never stored. A target the sheet no longer has is a gap the value
// At its offset falls into, and a value past the last target is dropped
export const createPastedRowData = (
  columns: Column[],
  targetColumns: (Column | undefined)[],
  pastedValues: string[],
): Row["data"] => {
  const data = createEmptyRowData(columns);
  for (const [columnOffset, pastedValue] of pastedValues.entries()) {
    if (columnOffset >= targetColumns.length) break;
    const column = targetColumns[columnOffset];
    if (column && checkIsEditableColumnValue(column)) data[column.name] = coerceValue(pastedValue, column.type);
  }
  return data;
};
