import type { ColumnType } from "#shared/models/tableEditor/file/ColumnType";

export interface ColumnStats {
  average: null | number;
  columnName: string;
  columnType: ColumnType;
  falseCount: null | number;
  maximum: null | number;
  minimum: null | number;
  nullCount: number;
  standardDeviation: null | number;
  trueCount: null | number;
  uniqueCount: null | number;
}
