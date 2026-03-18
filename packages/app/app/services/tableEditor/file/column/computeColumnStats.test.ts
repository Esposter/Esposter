import { Column } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { makeDataSource, makeNumberColumn, makeRow } from "@/composables/tableEditor/file/commands/testUtils.test";
import { computeColumnStats } from "@/services/tableEditor/file/column/computeColumnStats";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(computeColumnStats, () => {
  test(`number column computes min, max, avg, uniqueCount, nullCount`, () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [makeNumberColumn("")],
      [makeRow({ "": 0 }), makeRow({ "": 2 }), makeRow({ "": 2 }), makeRow({ "": null })],
    );

    expect(takeOne(computeColumnStats(dataSource), 0)).toStrictEqual({
      avg: 1.33,
      columnName: "",
      columnType: ColumnType.Number,
      falseCount: null,
      max: 2,
      min: 0,
      nullCount: 1,
      trueCount: null,
      uniqueCount: 2,
    });
  });

  test(`boolean column computes trueCount, falseCount, nullCount`, () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [new Column({ name: "", type: ColumnType.Boolean })],
      [makeRow({ "": true }), makeRow({ "": true }), makeRow({ "": false }), makeRow({ "": null })],
    );

    expect(takeOne(computeColumnStats(dataSource), 0)).toStrictEqual({
      avg: null,
      columnName: "",
      columnType: ColumnType.Boolean,
      falseCount: 1,
      max: null,
      min: null,
      nullCount: 1,
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
      avg: null,
      columnName: "",
      columnType: ColumnType.String,
      falseCount: null,
      max: null,
      min: null,
      nullCount: 1,
      trueCount: null,
      uniqueCount: 2,
    });
  });

  test("all null number column returns null stats", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeNumberColumn("")], [makeRow({ "": null })]);

    expect(takeOne(computeColumnStats(dataSource), 0)).toStrictEqual({
      avg: null,
      columnName: "",
      columnType: ColumnType.Number,
      falseCount: null,
      max: null,
      min: null,
      nullCount: 1,
      trueCount: null,
      uniqueCount: 0,
    });
  });

  test("empty rows returns zero counts and null stats", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeNumberColumn("")], []);

    expect(takeOne(computeColumnStats(dataSource), 0)).toStrictEqual({
      avg: null,
      columnName: "",
      columnType: ColumnType.Number,
      falseCount: null,
      max: null,
      min: null,
      nullCount: 0,
      trueCount: null,
      uniqueCount: 0,
    });
  });
});
