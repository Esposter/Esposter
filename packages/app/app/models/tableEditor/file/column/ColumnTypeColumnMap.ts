import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import type { DateColumn } from "#shared/models/tableEditor/file/column/DateColumn";

export interface ColumnTypeColumnMap {
  [ColumnType.Boolean]: Column<ColumnType.Boolean>;
  [ColumnType.Date]: DateColumn;
  [ColumnType.Number]: Column<ColumnType.Number>;
  [ColumnType.String]: Column;
}
