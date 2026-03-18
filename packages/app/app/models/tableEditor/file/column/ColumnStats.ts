import type { ColumnType } from "#shared/models/tableEditor/file/ColumnType";

export interface ColumnStats {
  avg: number | null;
  columnName: string;
  columnType: ColumnType;
  falseCount: number | null;
  max: number | null;
  min: number | null;
  nullCount: number;
  trueCount: number | null;
  uniqueCount: number | null;
}
