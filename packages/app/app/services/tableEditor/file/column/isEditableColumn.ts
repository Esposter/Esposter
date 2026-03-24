import type { EditableColumn } from "#shared/models/tableEditor/file/column/EditableColumn";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export const isEditableColumn = (column: DataSource["columns"][number]): column is EditableColumn =>
  column.type !== ColumnType.Computed;
