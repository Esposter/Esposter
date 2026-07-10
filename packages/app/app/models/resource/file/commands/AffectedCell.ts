import type { ColumnValue } from "#shared/models/resource/file/column/ColumnValue";

export interface AffectedCell {
  columnName: string;
  originalValue: ColumnValue;
  rowIndex: number;
}
