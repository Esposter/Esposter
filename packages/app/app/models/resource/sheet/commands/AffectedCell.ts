import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

export interface AffectedCell {
  columnName: string;
  originalValue: ColumnValue;
  rowIndex: number;
}
