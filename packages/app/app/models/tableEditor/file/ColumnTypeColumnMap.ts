import type { Column } from "#shared/models/tableEditor/file/Column";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import type { ColumnType } from "#shared/models/tableEditor/file/ColumnType";

export interface ColumnTypeColumnMap {
  [ColumnType.Boolean]: Column<ColumnType.Boolean>;
  [ColumnType.Date]: DateColumn;
  [ColumnType.Number]: Column<ColumnType.Number>;
  [ColumnType.String]: Column<ColumnType.String>;
}
