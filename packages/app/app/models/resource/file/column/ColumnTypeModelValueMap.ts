import type { ColumnType } from "#shared/models/resource/file/column/ColumnType";

export interface ColumnTypeModelValueMap {
  [ColumnType.Boolean]: boolean | null;
  [ColumnType.Date]: null | string;
  [ColumnType.Number]: null | number;
  [ColumnType.String]: null | string;
}
