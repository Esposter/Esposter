import { BooleanColumn } from "#shared/models/resource/sheet/column/BooleanColumn";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DateFormats } from "#shared/models/resource/sheet/column/DateFormat";
import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createDateColumn } from "@/composables/resource/sheet/commands/createDateColumn.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { computeColumnStatistics } from "@/services/resource/sheet/column/computeColumnStatistics";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(computeColumnStatistics, () => {
  test(`number column computes minimum, maximum, average, standardDeviation, uniqueCount, nullCount`, () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createNumberColumn("")],
      [createRow({ "": 0 }), createRow({ "": 2 }), createRow({ "": 2 }), createRow({ "": null })],
    );

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
      average: 1.33,
      columnName: "",
      columnType: ColumnType.Number,
      falseCount: undefined,
      maximum: 2,
      minimum: 0,
      mostFrequentValue: undefined,
      nullCount: 1,
      nullPercent: 25,
      standardDeviation: 0.94,
      summation: 4,
      topFrequencies: undefined,
      trueCount: undefined,
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
      average: 0.33,
      columnName: "",
      columnType: ColumnType.Number,
      falseCount: undefined,
      maximum: 1,
      minimum: 0,
      mostFrequentValue: undefined,
      nullCount: 0,
      nullPercent: 0,
      standardDeviation: 0.47,
      summation: 1,
      topFrequencies: undefined,
      trueCount: undefined,
      uniqueCount: 2,
    });
  });

  test(`number column with single value has standardDeviation of 0`, () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createNumberColumn("")], [createRow({ "": 1 })]);

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
      average: 1,
      columnName: "",
      columnType: ColumnType.Number,
      falseCount: undefined,
      maximum: 1,
      minimum: 1,
      mostFrequentValue: undefined,
      nullCount: 0,
      nullPercent: 0,
      standardDeviation: 0,
      summation: 1,
      topFrequencies: undefined,
      trueCount: undefined,
      uniqueCount: 1,
    });
  });

  test(`boolean column computes trueCount, falseCount, nullCount`, () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [new BooleanColumn({ name: "" })],
      [createRow({ "": true }), createRow({ "": true }), createRow({ "": false }), createRow({ "": null })],
    );

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
      average: undefined,
      columnName: "",
      columnType: ColumnType.Boolean,
      falseCount: 1,
      maximum: undefined,
      minimum: undefined,
      mostFrequentValue: undefined,
      nullCount: 1,
      nullPercent: 25,
      standardDeviation: undefined,
      summation: undefined,
      topFrequencies: undefined,
      trueCount: 2,
      uniqueCount: undefined,
    });
  });

  test(`string column computes uniqueCount, nullCount, nullPercent, mostFrequentValue`, () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [new StringColumn({ name: "" })],
      [createRow({ "": "" }), createRow({ "": " " }), createRow({ "": "" }), createRow({ "": null })],
    );

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
      average: undefined,
      columnName: "",
      columnType: ColumnType.String,
      falseCount: undefined,
      maximum: undefined,
      minimum: undefined,
      mostFrequentValue: "",
      nullCount: 1,
      nullPercent: 25,
      standardDeviation: undefined,
      summation: undefined,
      topFrequencies: [
        ["", 2],
        [" ", 1],
      ],
      trueCount: undefined,
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
      average: undefined,
      columnName: "",
      columnType: ColumnType.Date,
      falseCount: undefined,
      maximum: undefined,
      minimum: undefined,
      mostFrequentValue: "1970-01-01",
      nullCount: 1,
      nullPercent: 25,
      standardDeviation: undefined,
      summation: undefined,
      topFrequencies: [["1970-01", 3]],
      trueCount: undefined,
      uniqueCount: 2,
    });
  });

  test("all null number column returns undefined statistics", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createNumberColumn("")], [createRow({ "": null })]);

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
      average: undefined,
      columnName: "",
      columnType: ColumnType.Number,
      falseCount: undefined,
      maximum: undefined,
      minimum: undefined,
      mostFrequentValue: undefined,
      nullCount: 1,
      nullPercent: 100,
      standardDeviation: undefined,
      summation: 0,
      topFrequencies: undefined,
      trueCount: undefined,
      uniqueCount: 0,
    });
  });

  test("empty rows returns zero counts and undefined statistics", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createNumberColumn("")], []);

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
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
      summation: 0,
      topFrequencies: undefined,
      trueCount: undefined,
      uniqueCount: 0,
    });
  });

  test("string column with all null values returns undefined mostFrequentValue and 100 nullPercent", () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [new StringColumn({ name: "" })],
      [createRow({ "": null }), createRow({ "": null })],
    );

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
      average: undefined,
      columnName: "",
      columnType: ColumnType.String,
      falseCount: undefined,
      maximum: undefined,
      minimum: undefined,
      mostFrequentValue: undefined,
      nullCount: 2,
      nullPercent: 100,
      standardDeviation: undefined,
      summation: undefined,
      topFrequencies: [],
      trueCount: undefined,
      uniqueCount: 0,
    });
  });

  test("string column with no rows returns undefined nullPercent", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([new StringColumn({ name: "" })], []);

    expect(takeOne(computeColumnStatistics(dataSource))).toStrictEqual({
      average: undefined,
      columnName: "",
      columnType: ColumnType.String,
      falseCount: undefined,
      maximum: undefined,
      minimum: undefined,
      mostFrequentValue: undefined,
      nullCount: 0,
      nullPercent: undefined,
      standardDeviation: undefined,
      summation: undefined,
      topFrequencies: [],
      trueCount: undefined,
      uniqueCount: 0,
    });
  });

  test("string column with all unique values returns first-encountered mostFrequentValue with count 1", () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [new StringColumn({ name: "" })],
      [createRow({ "": "a" }), createRow({ "": "b" }), createRow({ "": "c" })],
    );

    const result = takeOne(computeColumnStatistics(dataSource));

    expect(result.mostFrequentValue).toBe("a");
    expect(result.uniqueCount).toBe(3);
    expect(result.nullPercent).toBe(0);
  });
});
