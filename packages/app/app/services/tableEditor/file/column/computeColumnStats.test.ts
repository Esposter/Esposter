import { BooleanColumn } from "#shared/models/tableEditor/file/column/BooleanColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { StringColumn } from "#shared/models/tableEditor/file/column/StringColumn";
import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import {
  makeDataSource,
  makeDateColumn,
  makeNumberColumn,
  makeRow,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { computeColumnStats } from "@/services/tableEditor/file/column/computeColumnStats";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(computeColumnStats, () => {
  test(`number column computes minimum, maximum, average, standardDeviation, uniqueCount, nullCount`, () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [makeNumberColumn("")],
      [makeRow({ "": 0 }), makeRow({ "": 2 }), makeRow({ "": 2 }), makeRow({ "": null })],
    );

    expect(takeOne(computeColumnStats(dataSource), 0)).toStrictEqual({
      average: 1.33,
      columnName: "",
      columnType: ColumnType.Number,
      emptyPercent: null,
      falseCount: null,
      maximum: 2,
      minimum: 0,
      mostFrequentValue: null,
      nullCount: 1,
      standardDeviation: 0.94,
      trueCount: null,
      uniqueCount: 2,
    });
  });

  test(`number column with repeating decimal mean computes standardDeviation precisely`, () => {
    expect.hasAssertions();

    // Mean = 1/3 (repeating decimal); variance = 2/9 ≈ 0.2222; std = √(2/9) ≈ 0.4714
    // Using raw mean avoids rounding error accumulation in the variance sum
    const dataSource = makeDataSource(
      [makeNumberColumn("")],
      [makeRow({ "": 0 }), makeRow({ "": 0 }), makeRow({ "": 1 })],
    );

    expect(takeOne(computeColumnStats(dataSource), 0)).toStrictEqual({
      average: 0.33,
      columnName: "",
      columnType: ColumnType.Number,
      emptyPercent: null,
      falseCount: null,
      maximum: 1,
      minimum: 0,
      mostFrequentValue: null,
      nullCount: 0,
      standardDeviation: 0.47,
      trueCount: null,
      uniqueCount: 2,
    });
  });

  test(`number column with single value has standardDeviation of 0`, () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeNumberColumn("")], [makeRow({ "": 1 })]);

    expect(takeOne(computeColumnStats(dataSource), 0)).toStrictEqual({
      average: 1,
      columnName: "",
      columnType: ColumnType.Number,
      emptyPercent: null,
      falseCount: null,
      maximum: 1,
      minimum: 1,
      mostFrequentValue: null,
      nullCount: 0,
      standardDeviation: 0,
      trueCount: null,
      uniqueCount: 1,
    });
  });

  test(`boolean column computes trueCount, falseCount, nullCount`, () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [new BooleanColumn({ name: "" })],
      [makeRow({ "": true }), makeRow({ "": true }), makeRow({ "": false }), makeRow({ "": null })],
    );

    expect(takeOne(computeColumnStats(dataSource), 0)).toStrictEqual({
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
    });
  });

  test(`string column computes uniqueCount, nullCount, emptyPercent, mostFrequentValue`, () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [new StringColumn({ name: "" })],
      [makeRow({ "": "" }), makeRow({ "": " " }), makeRow({ "": "" }), makeRow({ "": null })],
    );

    expect(takeOne(computeColumnStats(dataSource), 0)).toStrictEqual({
      average: null,
      columnName: "",
      columnType: ColumnType.String,
      emptyPercent: 25,
      falseCount: null,
      maximum: null,
      minimum: null,
      mostFrequentValue: "",
      nullCount: 1,
      standardDeviation: null,
      trueCount: null,
      uniqueCount: 2,
    });
  });

  test(`date column computes uniqueCount, nullCount, emptyPercent, mostFrequentValue`, () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [makeDateColumn("", takeOne(DATE_FORMATS, 0))],
      [
        makeRow({ "": "1970-01-01" }),
        makeRow({ "": "1970-01-02" }),
        makeRow({ "": "1970-01-01" }),
        makeRow({ "": null }),
      ],
    );

    expect(takeOne(computeColumnStats(dataSource), 0)).toStrictEqual({
      average: null,
      columnName: "",
      columnType: ColumnType.Date,
      emptyPercent: 25,
      falseCount: null,
      maximum: null,
      minimum: null,
      mostFrequentValue: "1970-01-01",
      nullCount: 1,
      standardDeviation: null,
      trueCount: null,
      uniqueCount: 2,
    });
  });

  test("all null number column returns null stats", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeNumberColumn("")], [makeRow({ "": null })]);

    expect(takeOne(computeColumnStats(dataSource), 0)).toStrictEqual({
      average: null,
      columnName: "",
      columnType: ColumnType.Number,
      emptyPercent: null,
      falseCount: null,
      maximum: null,
      minimum: null,
      mostFrequentValue: null,
      nullCount: 1,
      standardDeviation: null,
      trueCount: null,
      uniqueCount: 0,
    });
  });

  test("empty rows returns zero counts and null stats", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeNumberColumn("")], []);

    expect(takeOne(computeColumnStats(dataSource), 0)).toStrictEqual({
      average: null,
      columnName: "",
      columnType: ColumnType.Number,
      emptyPercent: null,
      falseCount: null,
      maximum: null,
      minimum: null,
      mostFrequentValue: null,
      nullCount: 0,
      standardDeviation: null,
      trueCount: null,
      uniqueCount: 0,
    });
  });

  test("string column with all null values returns null mostFrequentValue and 100 emptyPercent", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([new StringColumn({ name: "" })], [makeRow({ "": null }), makeRow({ "": null })]);

    expect(takeOne(computeColumnStats(dataSource), 0)).toStrictEqual({
      average: null,
      columnName: "",
      columnType: ColumnType.String,
      emptyPercent: 100,
      falseCount: null,
      maximum: null,
      minimum: null,
      mostFrequentValue: null,
      nullCount: 2,
      standardDeviation: null,
      trueCount: null,
      uniqueCount: 0,
    });
  });

  test("string column with no rows returns null emptyPercent", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([new StringColumn({ name: "" })], []);

    expect(takeOne(computeColumnStats(dataSource), 0)).toStrictEqual({
      average: null,
      columnName: "",
      columnType: ColumnType.String,
      emptyPercent: null,
      falseCount: null,
      maximum: null,
      minimum: null,
      mostFrequentValue: null,
      nullCount: 0,
      standardDeviation: null,
      trueCount: null,
      uniqueCount: 0,
    });
  });

  test("string column with all unique values returns first-encountered mostFrequentValue with count 1", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [new StringColumn({ name: "" })],
      [makeRow({ "": "a" }), makeRow({ "": "b" }), makeRow({ "": "c" })],
    );

    const result = takeOne(computeColumnStats(dataSource), 0);

    expect(result.mostFrequentValue).toBe("a");
    expect(result.uniqueCount).toBe(3);
    expect(result.emptyPercent).toBe(0);
  });
});
