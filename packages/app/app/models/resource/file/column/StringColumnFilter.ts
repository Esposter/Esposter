import { ColumnType } from "#shared/models/resource/file/column/ColumnType";

export interface StringColumnFilter {
  type: ColumnType.Date | ColumnType.String;
  value: string;
}
