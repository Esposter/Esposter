import type { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

export type EditableColumnValue = Exclude<DataSource["columns"][number], { type: ColumnType.Computed }>;
