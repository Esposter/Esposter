import type { ColumnStats } from "@/models/tableEditor/file/column/ColumnStats";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { computeColumnChartData } from "@/services/tableEditor/file/column/computeColumnChartData";
import { describe, expect, test } from "vitest";

describe(computeColumnChartData, () => {
  const makeNumberStats = (overrides: Partial<ColumnStats> = {}): ColumnStats => ({
    average: 1,
    columnName: "",
    columnType: ColumnType.Number,
    emptyPercent: null,
    falseCount: null,
    maximum: 2,
    minimum: 0,
    mostFrequentValue: null,
    nullCount: 0,
    standardDeviation: 1,
    trueCount: null,
    uniqueCount: 3,
    ...overrides,
  });

  const makeBooleanStats = (overrides: Partial<ColumnStats> = {}): ColumnStats => ({
    average: null,
    columnName: "",
    columnType: ColumnType.Boolean,
    emptyPercent: null,
    falseCount: 1,
    maximum: null,
    minimum: null,
    mostFrequentValue: null,
    nullCount: 1,
    standardDeviation: null,
    trueCount: 2,
    uniqueCount: null,
    ...overrides,
  });

  test(`number column returns bar chart with minimum, average, maximum`, () => {
    expect.hasAssertions();

    const result = computeColumnChartData(makeNumberStats({ average: 1, maximum: 2, minimum: 0 }));

    expect(result?.type).toBe("bar");
    expect(result?.series).toStrictEqual([{ data: [0, 1, 2], name: "" }]);
  });

  test(`number column series name matches column name`, () => {
    expect.hasAssertions();

    const result = computeColumnChartData(makeNumberStats({ columnName: " " }));

    expect(result?.series).toStrictEqual([{ data: [0, 1, 2], name: " " }]);
  });

  test(`number column with all null stats returns null`, () => {
    expect.hasAssertions();

    expect(computeColumnChartData(makeNumberStats({ average: null, maximum: null, minimum: null }))).toBeNull();
  });

  test(`boolean column returns pie chart with trueCount, falseCount, nullCount`, () => {
    expect.hasAssertions();

    const result = computeColumnChartData(makeBooleanStats({ falseCount: 1, nullCount: 1, trueCount: 2 }));

    expect(result?.type).toBe("pie");
    expect(result?.series).toStrictEqual([2, 1, 1]);
  });

  test(`string column returns null`, () => {
    expect.hasAssertions();

    const stringStats: ColumnStats = {
      average: null,
      columnName: "",
      columnType: ColumnType.String,
      emptyPercent: 0,
      falseCount: null,
      maximum: null,
      minimum: null,
      mostFrequentValue: null,
      nullCount: 0,
      standardDeviation: null,
      trueCount: null,
      uniqueCount: 1,
    };

    expect(computeColumnChartData(stringStats)).toBeNull();
  });

  test(`boolean column with null trueCount and falseCount defaults to 0`, () => {
    expect.hasAssertions();

    const result = computeColumnChartData(makeBooleanStats({ falseCount: null, nullCount: 2, trueCount: null }));

    expect(result?.series).toStrictEqual([0, 0, 2]);
  });
});
