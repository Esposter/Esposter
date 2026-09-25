import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { checkIsEditableColumnValue } from "@/services/resource/sheet/column/checkIsEditableColumnValue";
import { getValueSize } from "@/services/resource/sheet/commands/getValueSize";
import { takeOne } from "@esposter/shared";

// The one way a command writes a cell of a row already in the sheet, with the column's size moved by the difference.
// A computed column stores nothing, so a write to one is dropped here rather than at each command that might make
// It — a value left under its name reads as a cell of the row's own to everything that walks `row.data`
export const writeCellValue = (row: Row, column: Column, value: ColumnValue) => {
  if (!checkIsEditableColumnValue(column)) return;
  column.size += getValueSize(value) - getValueSize(takeOne(row.data, column.name));
  row.data[column.name] = value;
};
