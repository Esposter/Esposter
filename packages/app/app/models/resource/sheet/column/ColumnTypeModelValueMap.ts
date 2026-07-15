import type { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

export interface ColumnTypeModelValueMap {
  [ColumnType.Boolean]: boolean | null;
  [ColumnType.Date]: null | string;
  [ColumnType.Number]: null | number;
  [ColumnType.String]: null | string;
}
