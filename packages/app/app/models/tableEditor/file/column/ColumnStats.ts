import type { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export interface ColumnStats {
  average: null | number;
  columnName: string;
  columnType: ColumnType;
  falseCount: null | number;
  maximum: null | number;
  minimum: null | number;
  mostFrequentValue: null | string;
  nullCount: number;
  nullPercent: null | number;
  standardDeviation: null | number;
  sum: null | number;
  trueCount: null | number;
  uniqueCount: null | number;
}
