import { AggregationColumn } from "#shared/models/tableEditor/file/column/AggregationColumn";
import { AggregationTransformationType } from "#shared/models/tableEditor/file/column/AggregationTransformationType";
import { makeDataSource, makeNumberColumn, makeRow } from "@/composables/tableEditor/file/commands/testUtils.test";
import { computeAggregationValue } from "@/services/tableEditor/file/column/computeAggregationValue";
import { describe, expect, test } from "vitest";

describe(computeAggregationValue, () => {
  const sourceColumn = makeNumberColumn("");
  const rows = [makeRow({ "": 10 }), makeRow({ "": 20 }), makeRow({ "": 30 }), makeRow({ "": 40 })];
  const dataSource = makeDataSource([sourceColumn], rows);

  const makeAggregationColumn = (aggregationType: AggregationTransformationType): AggregationColumn =>
    new AggregationColumn({
      aggregationType,
      name: "agg",
      size: 0,
      sourceColumnId: sourceColumn.id,
      sourceName: "agg",
    });

  test("returns null when source column is not found", () => {
    expect.hasAssertions();

    const column = new AggregationColumn({
      aggregationType: AggregationTransformationType.RunningSum,
      name: "agg",
      size: 0,
      sourceColumnId: "-1",
      sourceName: "agg",
    });

    expect(computeAggregationValue(dataSource.rows, dataSource.columns, column, 0)).toBeNull();
  });

  test(`${AggregationTransformationType.PercentOfTotal} computes percentage of row value over total`, () => {
    expect.hasAssertions();

    const column = makeAggregationColumn(AggregationTransformationType.PercentOfTotal);

    // Total = 100, row[0] = 10 → 10%
    expect(computeAggregationValue(dataSource.rows, dataSource.columns, column, 0)).toBe(10);

    // Row[1] = 20 → 20%
    expect(computeAggregationValue(dataSource.rows, dataSource.columns, column, 1)).toBe(20);
  });

  test(`${AggregationTransformationType.Rank} returns 1-based descending rank`, () => {
    expect.hasAssertions();

    const column = makeAggregationColumn(AggregationTransformationType.Rank);

    // Values: [40, 30, 20, 10] sorted desc — 40 is rank 1
    expect(computeAggregationValue(dataSource.rows, dataSource.columns, column, 3)).toBe(1);

    // 10 is rank 4
    expect(computeAggregationValue(dataSource.rows, dataSource.columns, column, 0)).toBe(4);
  });

  test(`${AggregationTransformationType.RunningSum} accumulates from row 0 to rowIndex`, () => {
    expect.hasAssertions();

    const column = makeAggregationColumn(AggregationTransformationType.RunningSum);

    expect(computeAggregationValue(dataSource.rows, dataSource.columns, column, 0)).toBe(10);
    expect(computeAggregationValue(dataSource.rows, dataSource.columns, column, 1)).toBe(30);
    expect(computeAggregationValue(dataSource.rows, dataSource.columns, column, 2)).toBe(60);
    expect(computeAggregationValue(dataSource.rows, dataSource.columns, column, 3)).toBe(100);
  });

  test(`${AggregationTransformationType.PercentOfTotal} returns null for null row value`, () => {
    expect.hasAssertions();

    const column = makeAggregationColumn(AggregationTransformationType.PercentOfTotal);
    const rowsWithNull = [makeRow({ "": null }), makeRow({ "": 10 })];
    const dsWithNull = makeDataSource([sourceColumn], rowsWithNull);

    expect(computeAggregationValue(dsWithNull.rows, dsWithNull.columns, column, 0)).toBeNull();
  });

  test(`${AggregationTransformationType.PercentOfTotal} returns null when total is zero`, () => {
    expect.hasAssertions();

    const column = makeAggregationColumn(AggregationTransformationType.PercentOfTotal);
    const zeroRows = [makeRow({ "": 0 }), makeRow({ "": 0 })];
    const dsZero = makeDataSource([sourceColumn], zeroRows);

    expect(computeAggregationValue(dsZero.rows, dsZero.columns, column, 0)).toBeNull();
  });

  test(`${AggregationTransformationType.RunningSum} skips null values`, () => {
    expect.hasAssertions();

    const column = makeAggregationColumn(AggregationTransformationType.RunningSum);
    const rowsWithNull = [makeRow({ "": 10 }), makeRow({ "": null }), makeRow({ "": 20 })];
    const dsWithNull = makeDataSource([sourceColumn], rowsWithNull);

    expect(computeAggregationValue(dsWithNull.rows, dsWithNull.columns, column, 0)).toBe(10);
    expect(computeAggregationValue(dsWithNull.rows, dsWithNull.columns, column, 2)).toBe(30);
  });
});
