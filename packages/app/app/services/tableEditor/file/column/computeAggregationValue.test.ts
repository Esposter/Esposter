import type { AggregationTransformation } from "#shared/models/tableEditor/file/column/transformation/AggregationTransformation";

import { AggregationTransformationType } from "#shared/models/tableEditor/file/column/transformation/AggregationTransformationType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { createDataSource, createNumberColumn, createRow } from "@/composables/tableEditor/file/commands/testUtils.test";
import { computeAggregationValue } from "@/services/tableEditor/file/column/computeAggregationValue";
import { describe, expect, test } from "vitest";

describe(computeAggregationValue, () => {
  const sourceColumn = createNumberColumn("");
  const rows = [createRow({ "": 10 }), createRow({ "": 20 }), createRow({ "": 30 }), createRow({ "": 40 })];
  const dataSource = createDataSource([sourceColumn], rows);
  const findSource = (sourceColumnId: string) => dataSource.columns.find(({ id }) => id === sourceColumnId);

  const createAggregationTransformation = (
    aggregationTransformationType: AggregationTransformationType,
  ): AggregationTransformation => ({
    aggregationTransformationType,
    sourceColumnId: sourceColumn.id,
    type: ColumnTransformationType.Aggregation,
  });

  test("returns null when source column is not found", () => {
    expect.hasAssertions();

    const transformation: AggregationTransformation = {
      aggregationTransformationType: AggregationTransformationType.RunningSummation,
      sourceColumnId: "-1",
      type: ColumnTransformationType.Aggregation,
    };

    expect(computeAggregationValue(dataSource.rows, findSource, transformation, 0)).toBeNull();
  });

  test(`${AggregationTransformationType.PercentOfTotal} computes percentage of row value over total`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.PercentOfTotal);

    // Total = 100, row[0] = 10 → 10%
    expect(computeAggregationValue(dataSource.rows, findSource, transformation, 0)).toBe(10);

    // Row[1] = 20 → 20%
    expect(computeAggregationValue(dataSource.rows, findSource, transformation, 1)).toBe(20);
  });

  test(`${AggregationTransformationType.Rank} returns 1-based descending rank`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.Rank);

    // Values: [40, 30, 20, 10] sorted desc — 40 is rank 1
    expect(computeAggregationValue(dataSource.rows, findSource, transformation, 3)).toBe(1);

    // 10 is rank 4
    expect(computeAggregationValue(dataSource.rows, findSource, transformation, 0)).toBe(4);
  });

  test(`${AggregationTransformationType.RunningSummation} accumulates from row 0 to rowIndex`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.RunningSummation);

    expect(computeAggregationValue(dataSource.rows, findSource, transformation, 0)).toBe(10);
    expect(computeAggregationValue(dataSource.rows, findSource, transformation, 1)).toBe(30);
    expect(computeAggregationValue(dataSource.rows, findSource, transformation, 2)).toBe(60);
    expect(computeAggregationValue(dataSource.rows, findSource, transformation, 3)).toBe(100);
  });

  test(`${AggregationTransformationType.PercentOfTotal} returns null for null row value`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.PercentOfTotal);
    const rowsWithNull = [createRow({ "": null }), createRow({ "": 10 })];
    const dataSourceWithNull = createDataSource([sourceColumn], rowsWithNull);
    const findSourceWithNull = (sourceColumnId: string) =>
      dataSourceWithNull.columns.find(({ id }) => id === sourceColumnId);

    expect(computeAggregationValue(dataSourceWithNull.rows, findSourceWithNull, transformation, 0)).toBeNull();
  });

  test(`${AggregationTransformationType.PercentOfTotal} returns null when total is zero`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.PercentOfTotal);
    const zeroRows = [createRow({ "": 0 }), createRow({ "": 0 })];
    const dataSourceZero = createDataSource([sourceColumn], zeroRows);
    const findSourceZero = (sourceColumnId: string) => dataSourceZero.columns.find(({ id }) => id === sourceColumnId);

    expect(computeAggregationValue(dataSourceZero.rows, findSourceZero, transformation, 0)).toBeNull();
  });

  test(`${AggregationTransformationType.RunningSummation} skips null values`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.RunningSummation);
    const rowsWithNull = [createRow({ "": 10 }), createRow({ "": null }), createRow({ "": 20 })];
    const dataSourceWithNull = createDataSource([sourceColumn], rowsWithNull);
    const findSourceWithNull = (sourceColumnId: string) =>
      dataSourceWithNull.columns.find(({ id }) => id === sourceColumnId);

    expect(computeAggregationValue(dataSourceWithNull.rows, findSourceWithNull, transformation, 0)).toBe(10);
    expect(computeAggregationValue(dataSourceWithNull.rows, findSourceWithNull, transformation, 2)).toBe(30);
  });
});
