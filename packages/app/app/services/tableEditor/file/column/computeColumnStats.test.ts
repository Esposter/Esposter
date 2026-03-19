import { Column } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
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
      falseCount: null,
      maximum: 2,
      minimum: 0,
      nullCount: 1,
      standardDeviation: 0.94,
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
      falseCount: null,
      maximum: 1,
      minimum: 1,
      nullCount: 0,
      standardDeviation: 0,
      trueCount: null,
      uniqueCount: 1,
    });
  });

  test(`boolean column computes trueCount, falseCount, nullCount`, () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [new Column({ name: "", type: ColumnType.Boolean })],
      [makeRow({ "": true }), makeRow({ "": true }), makeRow({ "": false }), makeRow({ "": null })],
    );

    expect(takeOne(computeColumnStats(dataSource), 0)).toStrictEqual({
      average: null,
      columnName: "",
      columnType: ColumnType.Boolean,
      falseCount: 1,
      maximum: null,
      minimum: null,
      nullCount: 1,
      standardDeviation: null,
      trueCount: 2,
      uniqueCount: null,
    });
  });

  test(`string column computes uniqueCount and nullCount`, () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [new Column({ name: "", type: ColumnType.String })],
      [makeRow({ "": "" }), makeRow({ "": " " }), makeRow({ "": "" }), makeRow({ "": null })],
    );

    expect(takeOne(computeColumnStats(dataSource), 0)).toStrictEqual({
      average: null,
      columnName: "",
      columnType: ColumnType.String,
      falseCount: null,
      maximum: null,
      minimum: null,
      nullCount: 1,
      standardDeviation: null,
      trueCount: null,
      uniqueCount: 2,
    });
  });

  test(`date column computes uniqueCount and nullCount`, () => {
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
      falseCount: null,
      maximum: null,
      minimum: null,
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
      falseCount: null,
      maximum: null,
      minimum: null,
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
      falseCount: null,
      maximum: null,
      minimum: null,
      nullCount: 0,
      standardDeviation: null,
      trueCount: null,
      uniqueCount: 0,
    });
  });
});
