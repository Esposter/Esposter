import type { DatePartTransformation } from "#shared/models/resource/sheet/column/transformation/DatePartTransformation";

import { DateFormat } from "#shared/models/resource/sheet/column/DateFormat";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { DatePartType } from "#shared/models/resource/sheet/column/transformation/DatePartType";
import { computeDatePartTransformation } from "@/services/resource/sheet/column/transformation/computeDatePartTransformation";
import { describe, expect, test } from "vitest";

const createTransformation = (datePartType: DatePartType): DatePartTransformation => ({
  datePartType,
  sourceColumnId: "",
  type: ColumnTransformationType.DatePart,
});

describe(computeDatePartTransformation, () => {
  // Month is 1-indexed and weekday is 0-indexed from Sunday
  test.each([
    [DatePartType.Year, 1970, DateFormat["YYYY-MM-DD"], "1970-01-01"],
    [DatePartType.Month, 1, DateFormat["YYYY-MM-DD"], "1970-01-01"],
    [DatePartType.Day, 2, DateFormat["YYYY-MM-DD"], "1970-01-02"],
    [DatePartType.Weekday, 4, DateFormat["YYYY-MM-DD"], "1970-01-01"],
    [DatePartType.Hour, 0, DateFormat["YYYY-MM-DDTHH:mm:ss"], "1970-01-01T00:00:00"],
    [DatePartType.Minute, 0, DateFormat["YYYY-MM-DDTHH:mm:ss"], "1970-01-01T00:00:00"],
  ] as const)("extracts the %s from its source format", (datePartType, expected, format, value) => {
    expect.hasAssertions();

    expect(computeDatePartTransformation(value, createTransformation(datePartType), format)).toBe(expected);
  });

  test("returns null for invalid date", () => {
    expect.hasAssertions();
    expect(
      computeDatePartTransformation("not-a-date", createTransformation(DatePartType.Year), DateFormat["YYYY-MM-DD"]),
    ).toBeNull();
  });

  test("returns null for non-string value", () => {
    expect.hasAssertions();
    expect(
      computeDatePartTransformation(0, createTransformation(DatePartType.Year), DateFormat["YYYY-MM-DD"]),
    ).toBeNull();
  });
});
