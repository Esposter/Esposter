import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnTransformationBindContext } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationBindContext";

import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { createDateColumn } from "#shared/models/resource/sheet/column/createDateColumn.test";
import { DateFormat } from "#shared/models/resource/sheet/column/DateFormat";
import { AggregationTransformationType } from "#shared/models/resource/sheet/column/transformation/AggregationTransformationType";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { DatePartType } from "#shared/models/resource/sheet/column/transformation/DatePartType";
import { StringTransformationType } from "#shared/models/resource/sheet/column/transformation/string/StringTransformationType";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { ColumnTransformationCompileMap } from "#shared/services/resource/sheet/column/transformation/ColumnTransformationCompileMap";
import { describe, expect, test } from "vitest";

// Binds a source that reads one value on every row, so each transformation's per-value logic is what is under test
const createBindContext = (sourceValue: null | string, rows: ColumnTransformationBindContext["rows"] = []) =>
  ({ readSource: () => () => sourceValue, rows }) satisfies ColumnTransformationBindContext;

describe("columnTransformationCompileMap", () => {
  const sourceColumnId = crypto.randomUUID();
  const epochDate = new Date(0).toISOString().slice(0, 10);

  test(`${ColumnTransformationType.String} returns null for a null source value`, () => {
    expect.hasAssertions();
    expect(
      ColumnTransformationCompileMap[ColumnTransformationType.String](
        {
          sourceColumnId,
          stringTransformationType: StringTransformationType.UpperCase,
          type: ColumnTransformationType.String,
        },
        () => createColumn(""),
      )(createBindContext(null))(createRow({})),
    ).toBeNull();
  });

  test(`${ColumnTransformationType.StringSplit} returns null for a null source value`, () => {
    expect.hasAssertions();
    expect(
      ColumnTransformationCompileMap[ColumnTransformationType.StringSplit](
        { delimiter: ",", segmentIndex: 0, sourceColumnId, type: ColumnTransformationType.StringSplit },
        () => createColumn(""),
      )(createBindContext(null))(createRow({})),
    ).toBeNull();
  });

  test(`${ColumnTransformationType.Aggregation} returns null without rowIndex`, () => {
    expect.hasAssertions();

    const transformation = {
      aggregationTransformationType: AggregationTransformationType.Count,
      sourceColumnId,
      type: ColumnTransformationType.Aggregation,
    } as const;
    const sourceColumn = createColumn("");

    expect(
      ColumnTransformationCompileMap[ColumnTransformationType.Aggregation](
        transformation,
        () => sourceColumn,
      )(createBindContext(null, [createRow({ "": 0 })]))(createRow({ "": 0 })),
    ).toBeNull();
  });

  test(`${ColumnTransformationType.DatePart} returns null when the source column is not a date column`, () => {
    expect.hasAssertions();

    const transformation = {
      datePartType: DatePartType.Year,
      sourceColumnId,
      type: ColumnTransformationType.DatePart,
    } as const;
    const readYear = (sourceColumn: Column | undefined) =>
      ColumnTransformationCompileMap[ColumnTransformationType.DatePart](
        transformation,
        () => sourceColumn,
      )(createBindContext(epochDate))(createRow({}), 0);

    expect(readYear(createColumn(""))).toBeNull();
    expect(readYear(undefined)).toBeNull();
    expect(readYear(createDateColumn("", DateFormat["YYYY-MM-DD"]))).toBe(1970);
  });
});
