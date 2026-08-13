import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnTransformationComputeContext } from "@/models/resource/sheet/column/transformation/ColumnTransformationComputeContext";

import { DateFormat } from "#shared/models/resource/sheet/column/DateFormat";
import { AggregationTransformationType } from "#shared/models/resource/sheet/column/transformation/AggregationTransformationType";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { DatePartType } from "#shared/models/resource/sheet/column/transformation/DatePartType";
import { StringTransformationType } from "#shared/models/resource/sheet/column/transformation/string/StringTransformationType";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDateColumn } from "@/composables/resource/sheet/commands/createDateColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { ColumnTransformationComputeMap } from "@/services/resource/sheet/column/transformation/ColumnTransformationComputeMap";
import { describe, expect, test } from "vitest";

const createContext = (
  sourceValue: null | string,
  sourceColumn: Column | undefined,
  rows?: ColumnTransformationComputeContext["rows"],
  rowIndex?: number,
): ColumnTransformationComputeContext => ({
  computeSource: () => sourceValue,
  findSource: () => sourceColumn,
  rowIndex,
  rows,
});

describe("columnTransformationComputeMap", () => {
  const sourceColumnId = crypto.randomUUID();

  test(`${ColumnTransformationType.String} returns null for a null source value`, () => {
    expect.hasAssertions();
    expect(
      ColumnTransformationComputeMap[ColumnTransformationType.String](
        {
          sourceColumnId,
          stringTransformationType: StringTransformationType.UpperCase,
          type: ColumnTransformationType.String,
        },
        createContext(null, createColumn("")),
      ),
    ).toBeNull();
  });

  test(`${ColumnTransformationType.StringSplit} returns null for a null source value`, () => {
    expect.hasAssertions();
    expect(
      ColumnTransformationComputeMap[ColumnTransformationType.StringSplit](
        { delimiter: ",", segmentIndex: 0, sourceColumnId, type: ColumnTransformationType.StringSplit },
        createContext(null, createColumn("")),
      ),
    ).toBeNull();
  });

  test(`${ColumnTransformationType.Aggregation} returns null without rows and rowIndex`, () => {
    expect.hasAssertions();

    const transformation = {
      aggregationTransformationType: AggregationTransformationType.Count,
      sourceColumnId,
      type: ColumnTransformationType.Aggregation,
    } as const;
    const sourceColumn = createColumn("");

    expect(
      ColumnTransformationComputeMap[ColumnTransformationType.Aggregation](
        transformation,
        createContext(null, sourceColumn, undefined, 0),
      ),
    ).toBeNull();
    expect(
      ColumnTransformationComputeMap[ColumnTransformationType.Aggregation](
        transformation,
        createContext(null, sourceColumn, [createRow({ "": 0 })]),
      ),
    ).toBeNull();
  });

  test(`${ColumnTransformationType.DatePart} returns null when the source column is not a date column`, () => {
    expect.hasAssertions();

    const transformation = {
      part: DatePartType.Year,
      sourceColumnId,
      type: ColumnTransformationType.DatePart,
    } as const;

    expect(
      ColumnTransformationComputeMap[ColumnTransformationType.DatePart](
        transformation,
        createContext("1970-01-01", createColumn("")),
      ),
    ).toBeNull();
    expect(
      ColumnTransformationComputeMap[ColumnTransformationType.DatePart](
        transformation,
        createContext("1970-01-01", undefined),
      ),
    ).toBeNull();
    expect(
      ColumnTransformationComputeMap[ColumnTransformationType.DatePart](
        transformation,
        createContext("1970-01-01", createDateColumn("", DateFormat["YYYY-MM-DD"])),
      ),
    ).toBe(1970);
  });
});
