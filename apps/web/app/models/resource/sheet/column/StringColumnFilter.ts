import type { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

export interface StringColumnFilter {
  type: typeof ColumnType.Date | typeof ColumnType.String;
  value: string;
}
