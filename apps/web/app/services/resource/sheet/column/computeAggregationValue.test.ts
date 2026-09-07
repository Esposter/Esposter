import type { AggregationTransformation } from "#shared/models/resource/sheet/column/transformation/AggregationTransformation";

import { AggregationTransformationType } from "#shared/models/resource/sheet/column/transformation/AggregationTransformationType";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { computeAggregationValue } from "@/services/resource/sheet/column/computeAggregationValue";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(computeAggregationValue, () => {
  const sourceColumn = createNumberColumn("");
  const rows = [createRow({ "": 10 }), createRow({ "": 20 }), createRow({ "": 30 }), createRow({ "": 40 })];
  const dataSource = createDataSource([sourceColumn], rows);
  const findSource = (sourceColumnId: string) => dataSource.columns.find(({ id }) => id === sourceColumnId);
  const mixedRows = [createRow({ "": 10 }), createRow({ "": null }), createRow({ "": 20 })];
  const allNullRows = [createRow({ "": null })];
  const tiedRows = [createRow({ "": 10 }), createRow({ "": 10 }), createRow({ "": 20 })];

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

    // `row[1]` = 20 → 20%
    expect(computeAggregationValue(dataSource.rows, findSource, transformation, 1)).toBe(20);
  });

  test(`${AggregationTransformationType.Rank} returns 1-based descending rank`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.Rank);

    // Values: [40, 30, 20, 10] sorted desc — 40 is rank 1
    expect(computeAggregationValue(dataSource.rows, findSource, transformation, 3)).toBe(1);

    // 10 is rank 4
    expect(computeAggregationValue(dataSource.rows, findSource, transformation, 0)).toBe(4);

    // Tied values share the rank of the first occurrence
    expect(computeAggregationValue(tiedRows, findSource, transformation, 0)).toBe(2);
    expect(computeAggregationValue(tiedRows, findSource, transformation, 1)).toBe(2);
    expect(computeAggregationValue(tiedRows, findSource, transformation, 2)).toBe(1);
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

    expect(computeAggregationValue(mixedRows, findSource, transformation, 0)).toBe(10);
    expect(computeAggregationValue(mixedRows, findSource, transformation, 2)).toBe(30);
  });

  test(`${AggregationTransformationType.Average} averages non-null values and returns null when there are none`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.Average);

    expect(computeAggregationValue(dataSource.rows, findSource, transformation, 0)).toBe(25);
    expect(computeAggregationValue(mixedRows, findSource, transformation, 0)).toBe(15);
    expect(computeAggregationValue([takeOne(rows, 0)], findSource, transformation, 0)).toBe(10);
    expect(computeAggregationValue(allNullRows, findSource, transformation, 0)).toBeNull();
    expect(computeAggregationValue([], findSource, transformation, 0)).toBeNull();
  });

  test(`${AggregationTransformationType.Count} counts rows whose source value is a number`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.Count);

    expect(computeAggregationValue(dataSource.rows, findSource, transformation, 0)).toBe(4);
    expect(computeAggregationValue(mixedRows, findSource, transformation, 0)).toBe(2);
    expect(computeAggregationValue([createRow({ "": " " })], findSource, transformation, 0)).toBe(0);
    expect(computeAggregationValue(allNullRows, findSource, transformation, 0)).toBe(0);
    expect(computeAggregationValue([], findSource, transformation, 0)).toBe(0);
  });

  test(`${AggregationTransformationType.Maximum} returns the largest non-null value and null when there are none`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.Maximum);

    expect(computeAggregationValue(dataSource.rows, findSource, transformation, 0)).toBe(40);
    expect(computeAggregationValue(mixedRows, findSource, transformation, 0)).toBe(20);
    expect(computeAggregationValue(allNullRows, findSource, transformation, 0)).toBeNull();
    expect(computeAggregationValue([], findSource, transformation, 0)).toBeNull();
  });

  test(`${AggregationTransformationType.Minimum} returns the smallest non-null value and null when there are none`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.Minimum);

    expect(computeAggregationValue(dataSource.rows, findSource, transformation, 0)).toBe(10);
    expect(computeAggregationValue(mixedRows, findSource, transformation, 0)).toBe(10);
    expect(computeAggregationValue(allNullRows, findSource, transformation, 0)).toBeNull();
    expect(computeAggregationValue([], findSource, transformation, 0)).toBeNull();
  });
});
