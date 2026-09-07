import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

export interface StringColumnFilter {
  type: ColumnType.Date | ColumnType.String;
  value: string;
}
