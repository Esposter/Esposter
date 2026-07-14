import type { BooleanColumn } from "#shared/models/resource/sheet/column/BooleanColumn";
import type { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import type { ComputedColumn } from "#shared/models/resource/sheet/column/ComputedColumn";
import type { DateColumn } from "#shared/models/resource/sheet/column/DateColumn";
import type { NumberColumn } from "#shared/models/resource/sheet/column/NumberColumn";
import type { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";

export interface ColumnTypeColumnMap {
  [ColumnType.Boolean]: BooleanColumn;
  [ColumnType.Computed]: ComputedColumn;
  [ColumnType.Date]: DateColumn;
  [ColumnType.Number]: NumberColumn;
  [ColumnType.String]: StringColumn;
}
