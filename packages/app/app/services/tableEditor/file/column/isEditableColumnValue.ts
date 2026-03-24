import type { EditableColumnValue } from "#shared/models/tableEditor/file/column/EditableColumnValue";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export const isEditableColumnValue = (column: DataSource["columns"][number]): column is EditableColumnValue =>
  column.type !== ColumnType.Computed;
