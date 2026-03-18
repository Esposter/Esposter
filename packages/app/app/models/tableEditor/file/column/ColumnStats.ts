import type { ColumnType } from "#shared/models/tableEditor/file/ColumnType";

export interface ColumnStats {
  avg: null | number;
  columnName: string;
  columnType: ColumnType;
  falseCount: null | number;
  max: null | number;
  min: null | number;
  nullCount: number;
  trueCount: null | number;
  uniqueCount: null | number;
}
