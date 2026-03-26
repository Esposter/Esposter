import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";

export type EditableColumnValue = Exclude<Column, ComputedColumn>;
