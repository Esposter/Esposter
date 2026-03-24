import type { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export interface ColumnStats {
  average: null | number;
  columnName: string;
  columnType: ColumnType;
  emptyPercent: null | number;
  falseCount: null | number;
  maximum: null | number;
  minimum: null | number;
  mostFrequentValue: null | string;
  nullCount: number;
  standardDeviation: null | number;
  trueCount: null | number;
  uniqueCount: null | number;
}
