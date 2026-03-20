import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";

export interface StringColumnFilter {
  type: ColumnType.Date | ColumnType.String;
  value: string;
}
