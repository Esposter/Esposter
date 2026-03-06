import type { ColumnType } from "#shared/models/tableEditor/file/ColumnType";

export interface Column {
  readonly sourceFieldName: string;
  fieldName: string;
  type: ColumnType;
}
