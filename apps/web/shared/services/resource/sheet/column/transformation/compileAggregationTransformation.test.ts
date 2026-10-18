import type { AggregationTransformation } from "#shared/models/resource/sheet/column/transformation/AggregationTransformation";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

import { createNumberColumn } from "#shared/models/resource/sheet/column/createNumberColumn.test";
import { AggregationTransformationType } from "#shared/models/resource/sheet/column/transformation/AggregationTransformationType";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { compileAggregationTransformation } from "#shared/services/resource/sheet/column/transformation/compileAggregationTransformation";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(compileAggregationTransformation, () => {
  const sourceColumn = createNumberColumn("");
  const findSource = (sourceColumnId: string) => (sourceColumnId === sourceColumn.id ? sourceColumn : undefined);
  const readSource = () => (row: ToData<Row>) => takeOne(row.data, sourceColumn.name);
  const rows = [createRow({ "": 1 }), createRow({ "": 2 }), createRow({ "": 3 }), createRow({ "": 4 })];
  const mixedRows = [createRow({ "": 1 }), createRow({ "": null }), createRow({ "": 2 })];
  const allNullRows = [createRow({ "": null })];
  const tiedRows = [createRow({ "": 1 }), createRow({ "": 1 }), createRow({ "": 2 })];

  const createAggregationTransformation = (
    aggregationTransformationType: AggregationTransformationType,
    sourceColumnId = sourceColumn.id,
  ): AggregationTransformation => ({
    aggregationTransformationType,
    sourceColumnId,
    type: ColumnTransformationType.Aggregation,
  });
  // Binds the transformation over a row list, then reads the cell at rowIndex
  const readAggregation = (transformation: AggregationTransformation, rowList: ToData<Row>[], rowIndex: number) =>
    compileAggregationTransformation(transformation, findSource)({ readSource, rows: rowList })(
      createRow({}),
      rowIndex,
    );

  test("returns null when source column is not found", () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.RunningSummation, "-1");

    expect(readAggregation(transformation, rows, 0)).toBeNull();
  });

  test(`${AggregationTransformationType.PercentOfTotal} computes percentage of row value over total`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.PercentOfTotal);

    // Total = 10, row[0] = 1 → 10%
    expect(readAggregation(transformation, rows, 0)).toBe(10);

    // `row[1]` = 2 → 20%
    expect(readAggregation(transformation, rows, 1)).toBe(20);
  });

  test(`${AggregationTransformationType.Rank} returns 1-based descending rank`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.Rank);

    // Values: [4, 3, 2, 1] sorted desc — 4 is rank 1
    expect(readAggregation(transformation, rows, 3)).toBe(1);

    // 1 is rank 4
    expect(readAggregation(transformation, rows, 0)).toBe(4);

    // Tied values share the rank of the first occurrence
    expect(readAggregation(transformation, tiedRows, 0)).toBe(2);
    expect(readAggregation(transformation, tiedRows, 1)).toBe(2);
    expect(readAggregation(transformation, tiedRows, 2)).toBe(1);
  });

  test(`${AggregationTransformationType.RunningSummation} accumulates from row 0 to rowIndex`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.RunningSummation);

    expect(readAggregation(transformation, rows, 0)).toBe(1);
    expect(readAggregation(transformation, rows, 1)).toBe(3);
    expect(readAggregation(transformation, rows, 2)).toBe(6);
    expect(readAggregation(transformation, rows, 3)).toBe(10);
  });

  test(`${AggregationTransformationType.PercentOfTotal} returns null for null row value`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.PercentOfTotal);
    const rowsWithNull = [createRow({ "": null }), createRow({ "": 1 })];

    expect(readAggregation(transformation, rowsWithNull, 0)).toBeNull();
  });

  test(`${AggregationTransformationType.PercentOfTotal} returns null when total is zero`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.PercentOfTotal);
    const zeroRows = [createRow({ "": 0 }), createRow({ "": 0 })];

    expect(readAggregation(transformation, zeroRows, 0)).toBeNull();
  });

  test(`${AggregationTransformationType.RunningSummation} skips null values`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.RunningSummation);

    expect(readAggregation(transformation, mixedRows, 0)).toBe(1);
    expect(readAggregation(transformation, mixedRows, 2)).toBe(3);
  });

  test(`${AggregationTransformationType.Average} averages non-null values and returns null when there are none`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.Average);

    expect(readAggregation(transformation, rows, 0)).toBe(2.5);
    expect(readAggregation(transformation, mixedRows, 0)).toBe(1.5);
    expect(readAggregation(transformation, [takeOne(rows, 0)], 0)).toBe(1);
    expect(readAggregation(transformation, allNullRows, 0)).toBeNull();
    expect(readAggregation(transformation, [], 0)).toBeNull();
  });

  test(`${AggregationTransformationType.Count} counts rows whose source value is a number`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.Count);

    expect(readAggregation(transformation, rows, 0)).toBe(4);
    expect(readAggregation(transformation, mixedRows, 0)).toBe(2);
    expect(readAggregation(transformation, [createRow({ "": " " })], 0)).toBe(0);
    expect(readAggregation(transformation, allNullRows, 0)).toBe(0);
    expect(readAggregation(transformation, [], 0)).toBe(0);
  });

  test(`${AggregationTransformationType.Maximum} returns the largest non-null value and null when there are none`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.Maximum);

    expect(readAggregation(transformation, rows, 0)).toBe(4);
    expect(readAggregation(transformation, mixedRows, 0)).toBe(2);
    expect(readAggregation(transformation, allNullRows, 0)).toBeNull();
    expect(readAggregation(transformation, [], 0)).toBeNull();
  });

  test(`${AggregationTransformationType.Minimum} returns the smallest non-null value and null when there are none`, () => {
    expect.hasAssertions();

    const transformation = createAggregationTransformation(AggregationTransformationType.Minimum);

    expect(readAggregation(transformation, rows, 0)).toBe(1);
    expect(readAggregation(transformation, mixedRows, 0)).toBe(1);
    expect(readAggregation(transformation, allNullRows, 0)).toBeNull();
    expect(readAggregation(transformation, [], 0)).toBeNull();
  });
});
