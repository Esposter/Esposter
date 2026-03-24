import type { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

export type EditableColumn = Exclude<DataSource["columns"][number], { type: ColumnType.Computed }>;
