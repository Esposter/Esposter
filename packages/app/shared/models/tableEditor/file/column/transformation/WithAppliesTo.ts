import type { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export interface WithAppliesTo {
  readonly appliesTo: ColumnType[];
}
