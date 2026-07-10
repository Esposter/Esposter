import type { BooleanColumn } from "#shared/models/resource/file/column/BooleanColumn";
import type { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import type { ComputedColumn } from "#shared/models/resource/file/column/ComputedColumn";
import type { DateColumn } from "#shared/models/resource/file/column/DateColumn";
import type { NumberColumn } from "#shared/models/resource/file/column/NumberColumn";
import type { StringColumn } from "#shared/models/resource/file/column/StringColumn";

export interface ColumnTypeColumnMap {
  [ColumnType.Boolean]: BooleanColumn;
  [ColumnType.Computed]: ComputedColumn;
  [ColumnType.Date]: DateColumn;
  [ColumnType.Number]: NumberColumn;
  [ColumnType.String]: StringColumn;
}
