import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ComputedColumn } from "#shared/models/resource/sheet/column/ComputedColumn";

export type EditableColumnValue = Exclude<Column, ComputedColumn>;
