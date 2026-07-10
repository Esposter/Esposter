import type { Column } from "#shared/models/resource/file/column/Column";
import type { ComputedColumn } from "#shared/models/resource/file/column/ComputedColumn";

export type EditableColumnValue = Exclude<Column, ComputedColumn>;
