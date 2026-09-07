import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { describe } from "vitest";

// Every statistic a column can carry, all absent
export const createColumnStatistics = (overrides: Partial<ColumnStatistics> = {}): ColumnStatistics => ({
  average: undefined,
  columnName: "",
  columnType: ColumnType.Number,
  falseCount: undefined,
  maximum: undefined,
  minimum: undefined,
  mostFrequentValue: undefined,
  nullCount: 0,
  nullPercentage: undefined,
  standardDeviation: undefined,
  summation: undefined,
  topFrequencies: undefined,
  trueCount: undefined,
  uniqueCount: undefined,
  ...overrides,
});

describe.todo("createColumnStatistics");
