import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

export interface NumberRangeColumnFilter {
  maximum: string;
  minimum: string;
  type: ColumnType.Number;
}
