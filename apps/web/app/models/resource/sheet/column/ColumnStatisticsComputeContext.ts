import type { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

export interface ColumnStatisticsComputeContext {
  columnType: ColumnType;
  nonNullBooleans: boolean[];
  nonNullNumbers: number[];
  nonNullStrings: string[];
  nullCount: number;
  // Counted once for the whole column, so the most-frequent value and the top frequencies read the same tally
  stringCountMap: Map<string, number>;
  values: (ColumnValue | undefined)[];
}
