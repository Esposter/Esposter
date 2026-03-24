import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export interface NumberRangeColumnFilter {
  maximum: string;
  minimum: string;
  type: ColumnType.Number;
}
