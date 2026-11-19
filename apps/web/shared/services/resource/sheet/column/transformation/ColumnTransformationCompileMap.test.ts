import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnTransformationBindContext } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationBindContext";
import type { ToData } from "@esposter/shared";

import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { createDateColumn } from "#shared/models/resource/sheet/column/createDateColumn.test";
import { DateFormat } from "#shared/models/resource/sheet/column/DateFormat";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { DatePartType } from "#shared/models/resource/sheet/column/transformation/DatePartType";
import { StringTransformationType } from "#shared/models/resource/sheet/column/transformation/string/StringTransformationType";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { ColumnTransformationCompileMap } from "#shared/services/resource/sheet/column/transformation/ColumnTransformationCompileMap";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// Binds a source that reads one value on every row, so each transformation's per-value logic is what is under test
const createBindContext = (sourceValue: null | string, rows: ColumnTransformationBindContext["rows"] = []) =>
  ({ readSource: () => () => sourceValue, rows }) satisfies ColumnTransformationBindContext;

describe("columnTransformationCompileMap", () => {
  const sourceColumnId = v7();
  const epochDate = new Date(0).toISOString().slice(0, 10);

  test(`${ColumnTransformationType.String} and ${ColumnTransformationType.StringSplit} return null for a null source value`, () => {
    expect.hasAssertions();

    const bindContext = createBindContext(null);

    expect(
      ColumnTransformationCompileMap[ColumnTransformationType.String]({
        sourceColumnId,
        stringTransformationType: StringTransformationType.UpperCase,
        type: ColumnTransformationType.String,
      })(bindContext)(createRow({}), 0),
    ).toBeNull();
    expect(
      ColumnTransformationCompileMap[ColumnTransformationType.StringSplit]({
        delimiter: ",",
        segmentIndex: 0,
        sourceColumnId,
        type: ColumnTransformationType.StringSplit,
      })(bindContext)(createRow({}), 0),
    ).toBeNull();
  });

  test(`${ColumnTransformationType.DatePart} returns null when the source column is not a date column`, () => {
    expect.hasAssertions();

    const transformation = {
      datePartType: DatePartType.Year,
      sourceColumnId,
      type: ColumnTransformationType.DatePart,
    } as const;
    const readYear = (sourceColumn: ToData<Column> | undefined) =>
      ColumnTransformationCompileMap[ColumnTransformationType.DatePart](
        transformation,
        () => sourceColumn,
      )(createBindContext(epochDate))(createRow({}), 0);

    expect(readYear(createColumn(""))).toBeNull();
    expect(readYear(undefined)).toBeNull();
    expect(readYear(createDateColumn("", DateFormat["YYYY-MM-DD"]))).toBe(1970);
  });
});
