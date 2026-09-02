import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { describe } from "vitest";

// Every statistic a column can carry, all absent. Spelled out in full rather than asserted, so a new statistic
// Fails to compile here instead of reaching a chart test as a missing key — the ones a test asserts on are the
// Ones it overrides.
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
