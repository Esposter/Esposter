import type { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export interface WithApplicableColumnTypes {
  readonly applicableColumnTypes: ColumnType[];
}
