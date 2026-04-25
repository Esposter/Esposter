import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export interface StringColumnFilter {
  type: ColumnType.Date | ColumnType.String;
  value: string;
}
