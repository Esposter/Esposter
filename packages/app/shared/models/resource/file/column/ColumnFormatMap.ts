import type { BooleanFormat } from "#shared/models/resource/file/column/BooleanFormat";
import type { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import type { DateFormat } from "#shared/models/resource/file/column/DateFormat";
import type { NumberFormat } from "#shared/models/resource/file/column/NumberFormat";

export interface ColumnFormatMap {
  [ColumnType.Boolean]: BooleanFormat;
  [ColumnType.Computed]: never;
  [ColumnType.Date]: DateFormat;
  [ColumnType.Number]: NumberFormat;
  [ColumnType.String]: never;
}
