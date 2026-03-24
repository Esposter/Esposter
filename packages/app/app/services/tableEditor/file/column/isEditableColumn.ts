import type { EditableColumn } from "#shared/models/tableEditor/file/EditableColumn";

import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";

export const isEditableColumn = (column: DataSource["columns"][number]): column is EditableColumn =>
  column.type !== ColumnType.Computed;
