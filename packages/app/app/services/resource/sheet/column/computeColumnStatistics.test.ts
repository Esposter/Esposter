import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DateFormats } from "#shared/models/resource/sheet/column/DateFormat";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { createBooleanColumn } from "@/composables/resource/sheet/commands/createBooleanColumn.test";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createComputedColumn } from "@/composables/resource/sheet/commands/createComputedColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createDateColumn } from "@/composables/resource/sheet/commands/createDateColumn.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { computeColumnStatistics } from "@/services/resource/sheet/column/computeColumnStatistics";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(computeColumnStatistics, () => {
  const baseStatistics: ColumnStatistics = {
    average: undefined,
    columnName: "",
    columnType: ColumnType.Number,
    falseCount: undefined,
    maximum: undefined,
    minimum: undefined,
    mostFrequentValue: undefined,
    nullCount: 0,
    nullPercent: undefined,
    standardDeviation: undefined,
    summation: undefined,
    topFrequencies: undefined,
    trueCount: undefined,
    uniqueCount: undefined,
  };

  test(`number column computes minimum, maximum, average, standardDeviation, uniqueCount, nullCount`, () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createNumberColumn("")],
      [createRow({ "": 0 }), createRow({ "": 2 }), createRow({ "": 2 }), createRow({ "": null })],
    );

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
      ...baseStatistics,
      average: 1.33,
      maximum: 2,
      minimum: 0,
      nullCount: 1,
      nullPercent: 25,
      standardDeviation: 0.94,
      summation: 4,
      uniqueCount: 2,
    });
  });

  test(`number column with repeating decimal mean computes standardDeviation precisely`, () => {
    expect.hasAssertions();

    // Mean = 1/3 (repeating decimal); variance = 2/9 ≈ 0.2222; std = √(2/9) ≈ 0.4714
    // Using raw mean avoids rounding error accumulation in the variance sum
    const dataSource = createDataSource(
      [createNumberColumn("")],
      [createRow({ "": 0 }), createRow({ "": 0 }), createRow({ "": 1 })],
    );

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
      ...baseStatistics,
      average: 0.33,
      maximum: 1,
      minimum: 0,
      nullPercent: 0,
      standardDeviation: 0.47,
      summation: 1,
      uniqueCount: 2,
    });
  });

  test(`number column with single value has standardDeviation of 0`, () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createNumberColumn("")], [createRow({ "": 1 })]);

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
      ...baseStatistics,
      average: 1,
      maximum: 1,
      minimum: 1,
      nullPercent: 0,
      standardDeviation: 0,
      summation: 1,
      uniqueCount: 1,
    });
  });

  test(`boolean column computes trueCount, falseCount, nullCount`, () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createBooleanColumn("")],
      [createRow({ "": true }), createRow({ "": true }), createRow({ "": false }), createRow({ "": null })],
    );

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
      ...baseStatistics,
      columnType: ColumnType.Boolean,
      falseCount: 1,
      nullCount: 1,
      nullPercent: 25,
      trueCount: 2,
    });
  });

  test(`string column computes uniqueCount, nullCount, nullPercent, mostFrequentValue`, () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("")],
      [createRow({ "": "" }), createRow({ "": " " }), createRow({ "": "" }), createRow({ "": null })],
    );

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
      ...baseStatistics,
      columnType: ColumnType.String,
      mostFrequentValue: "",
      nullCount: 1,
      nullPercent: 25,
      topFrequencies: [
        ["", 2],
        [" ", 1],
      ],
      uniqueCount: 2,
    });
  });

  test(`date column computes uniqueCount, nullCount, nullPercent, mostFrequentValue`, () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createDateColumn("", takeOne(DateFormats))],
      [
        createRow({ "": "1970-01-01" }),
        createRow({ "": "1970-01-02" }),
        createRow({ "": "1970-01-01" }),
        createRow({ "": null }),
      ],
    );

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
      ...baseStatistics,
      columnType: ColumnType.Date,
      mostFrequentValue: "1970-01-01",
      nullCount: 1,
      nullPercent: 25,
      topFrequencies: [["1970-01", 3]],
      uniqueCount: 2,
    });
  });

  test("all null number column returns undefined statistics", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createNumberColumn("")], [createRow({ "": null })]);

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
      ...baseStatistics,
      nullCount: 1,
      nullPercent: 100,
      summation: 0,
      uniqueCount: 0,
    });
  });

  test("empty rows returns zero counts and undefined statistics", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createNumberColumn("")]);

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
      ...baseStatistics,
      summation: 0,
      uniqueCount: 0,
    });
  });

  test("string column with all null values returns undefined mostFrequentValue and 100 nullPercent", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("")], [createRow({ "": null }), createRow({ "": null })]);

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
      ...baseStatistics,
      columnType: ColumnType.String,
      nullCount: 2,
      nullPercent: 100,
      topFrequencies: [],
      uniqueCount: 0,
    });
  });

  // A computed column stores nothing in row.data, so its statistics only exist if they are read through the
  // Same resolver the grid renders with — and they are reported under the type that resolver produces
  test("computed column computes statistics from its resolved values", () => {
    expect.hasAssertions();

    const sourceColumn = createNumberColumn("");
    const computedColumn = createComputedColumn(" ", sourceColumn.id, {
      sourceColumnId: sourceColumn.id,
      targetType: ColumnType.Number,
      type: ColumnTransformationType.ConvertTo,
    });
    const dataSource = createDataSource(
      [sourceColumn, computedColumn],
      [createRow({ "": 0 }), createRow({ "": 2 }), createRow({ "": 2 }), createRow({ "": null })],
    );

    expect(takeOne(computeColumnStatistics(dataSource), 1)).toStrictEqual({
      ...baseStatistics,
      average: 1.33,
      columnName: " ",
      maximum: 2,
      minimum: 0,
      nullCount: 1,
      nullPercent: 25,
      standardDeviation: 0.94,
      summation: 4,
      uniqueCount: 2,
    });
  });

  test("string column with all unique values returns first-encountered mostFrequentValue with count 1", () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("")],
      [createRow({ "": "a" }), createRow({ "": "b" }), createRow({ "": "c" })],
    );
    const result = takeOne(computeColumnStatistics(dataSource));

    expect(result.mostFrequentValue).toBe("a");
    expect(result.uniqueCount).toBe(3);
  });
});
