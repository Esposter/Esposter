import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { computeColumnChartData } from "@/services/resource/sheet/column/computeColumnChartData";
import { describe, expect, test } from "vitest";

const createNumberStats = (overrides: Partial<ColumnStatistics> = {}): ColumnStatistics => ({
  average: 1,
  columnName: "",
  columnType: ColumnType.Number,
  falseCount: undefined,
  maximum: 2,
  minimum: 0,
  mostFrequentValue: undefined,
  nullCount: 0,
  nullPercent: undefined,
  standardDeviation: 1,
  summation: 0,
  topFrequencies: undefined,
  trueCount: undefined,
  uniqueCount: 3,
  ...overrides,
});

const createBooleanStats = (overrides: Partial<ColumnStatistics> = {}): ColumnStatistics => ({
  average: undefined,
  columnName: "",
  columnType: ColumnType.Boolean,
  falseCount: 1,
  maximum: undefined,
  minimum: undefined,
  mostFrequentValue: undefined,
  nullCount: 1,
  nullPercent: undefined,
  standardDeviation: undefined,
  summation: undefined,
  topFrequencies: undefined,
  trueCount: 2,
  uniqueCount: undefined,
  ...overrides,
});

const createStringStats = (overrides: Partial<ColumnStatistics> = {}): ColumnStatistics => ({
  average: undefined,
  columnName: "",
  columnType: ColumnType.String,
  falseCount: undefined,
  maximum: undefined,
  minimum: undefined,
  mostFrequentValue: undefined,
  nullCount: 0,
  nullPercent: 0,
  standardDeviation: undefined,
  summation: undefined,
  topFrequencies: undefined,
  trueCount: undefined,
  uniqueCount: 1,
  ...overrides,
});

describe(computeColumnChartData, () => {
  test(`number column returns bar chart with minimum, average, maximum`, () => {
    expect.hasAssertions();

    const result = computeColumnChartData(createNumberStats({ average: 1, maximum: 2, minimum: 0 }));

    expect(result?.type).toBe("bar");
    expect(result?.series).toStrictEqual([{ data: [0, 1, 2], name: "" }]);
  });

  test(`number column with all undefined statistics returns undefined`, () => {
    expect.hasAssertions();

    expect(
      computeColumnChartData(createNumberStats({ average: undefined, maximum: undefined, minimum: undefined })),
    ).toBeUndefined();
  });

  test(`boolean column returns pie chart with trueCount, falseCount, nullCount`, () => {
    expect.hasAssertions();

    const result = computeColumnChartData(createBooleanStats({ falseCount: 1, nullCount: 1, trueCount: 2 }));

    expect(result?.type).toBe("pie");
    expect(result?.series).toStrictEqual([2, 1, 1]);
  });

  test(`boolean column with undefined trueCount and falseCount defaults to 0`, () => {
    expect.hasAssertions();

    const result = computeColumnChartData(
      createBooleanStats({ falseCount: undefined, nullCount: 2, trueCount: undefined }),
    );

    expect(result?.series).toStrictEqual([0, 0, 2]);
  });

  test(`string column with no top frequencies returns undefined`, () => {
    expect.hasAssertions();

    expect(computeColumnChartData(createStringStats({ topFrequencies: undefined }))).toBeUndefined();
  });

  test(`string column returns horizontal bar chart of top frequencies`, () => {
    expect.hasAssertions();

    const result = computeColumnChartData(
      createStringStats({
        columnName: " ",
        topFrequencies: [
          ["a", 3],
          ["b", 1],
        ],
      }),
    );

    expect(result?.type).toBe("bar");
    expect(result?.series).toStrictEqual([{ data: [1, 3], name: " " }]);
  });
});
