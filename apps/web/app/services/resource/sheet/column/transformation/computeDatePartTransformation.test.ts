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
  const epochDate = new Date(0).toISOString().slice(0, 10);
  // The day is read off the epoch's second day, so a month read in its place would answer differently
  const nextDayDate = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds")).toISOString().slice(0, 10);
  const epochDateTime = new Date(0).toISOString().slice(0, 19);

  // Month is 1-indexed and weekday is 0-indexed from Sunday
  test.each([
    [DatePartType.Year, 1970, DateFormat["YYYY-MM-DD"], epochDate],
    [DatePartType.Month, 1, DateFormat["YYYY-MM-DD"], epochDate],
    [DatePartType.Day, 2, DateFormat["YYYY-MM-DD"], nextDayDate],
    [DatePartType.Weekday, 4, DateFormat["YYYY-MM-DD"], epochDate],
    [DatePartType.Hour, 0, DateFormat["YYYY-MM-DDTHH:mm:ss"], epochDateTime],
    [DatePartType.Minute, 0, DateFormat["YYYY-MM-DDTHH:mm:ss"], epochDateTime],
  ] as const)("extracts the %s from its source format", (datePartType, expected, format, value) => {
    expect.hasAssertions();

    expect(computeDatePartTransformation(value, createTransformation(datePartType), format)).toBe(expected);
  });

  test("returns null for invalid date", () => {
    expect.hasAssertions();
    expect(
      computeDatePartTransformation("a", createTransformation(DatePartType.Year), DateFormat["YYYY-MM-DD"]),
    ).toBeNull();
  });

  test("returns null for non-string value", () => {
    expect.hasAssertions();
    expect(
      computeDatePartTransformation(0, createTransformation(DatePartType.Year), DateFormat["YYYY-MM-DD"]),
    ).toBeNull();
  });
});
