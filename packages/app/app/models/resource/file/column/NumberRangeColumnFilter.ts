import { ColumnType } from "#shared/models/resource/file/column/ColumnType";

export interface NumberRangeColumnFilter {
  maximum: string;
  minimum: string;
  type: ColumnType.Number;
}
