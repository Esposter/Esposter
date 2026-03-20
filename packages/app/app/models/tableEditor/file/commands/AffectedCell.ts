import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";

export interface AffectedCell {
  columnName: string;
  originalValue: ColumnValue;
  rowIndex: number;
}
