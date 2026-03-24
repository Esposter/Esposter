import type { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export interface ColumnTypeModelValueMap {
  [ColumnType.Boolean]: boolean | null;
  [ColumnType.Date]: null | string;
  [ColumnType.Number]: null | number;
  [ColumnType.String]: null | string;
}
