import type { BooleanFormat } from "#shared/models/tableEditor/file/column/BooleanFormat";
import type { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import type { DateFormat } from "#shared/models/tableEditor/file/column/DateFormat";
import type { NumberFormat } from "#shared/models/tableEditor/file/column/NumberFormat";

export type ColumnFormat = BooleanFormat | DateFormat | NumberFormat;

export interface ColumnFormatMap {
  [ColumnType.Aggregation]: NumberFormat;
  [ColumnType.Boolean]: BooleanFormat;
  [ColumnType.Computed]: ColumnFormat;
  [ColumnType.Date]: DateFormat;
  [ColumnType.Number]: NumberFormat;
  [ColumnType.String]: never;
}
