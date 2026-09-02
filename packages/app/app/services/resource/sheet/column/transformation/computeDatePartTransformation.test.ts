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
  test("extracts each date part from its source format", () => {
    expect.hasAssertions();

    // Month is 1-indexed and weekday is 0-indexed from Sunday
    const cases: { datePartType: DatePartType; expected: number; format: DateFormat; value: string }[] = [
      { datePartType: DatePartType.Year, expected: 1970, format: DateFormat["YYYY-MM-DD"], value: "1970-01-01" },
      { datePartType: DatePartType.Month, expected: 1, format: DateFormat["YYYY-MM-DD"], value: "1970-01-01" },
      { datePartType: DatePartType.Day, expected: 2, format: DateFormat["YYYY-MM-DD"], value: "1970-01-02" },
      { datePartType: DatePartType.Weekday, expected: 4, format: DateFormat["YYYY-MM-DD"], value: "1970-01-01" },
      {
        datePartType: DatePartType.Hour,
        expected: 0,
        format: DateFormat["YYYY-MM-DDTHH:mm:ss"],
        value: "1970-01-01T00:00:00",
      },
      {
        datePartType: DatePartType.Minute,
        expected: 0,
        format: DateFormat["YYYY-MM-DDTHH:mm:ss"],
        value: "1970-01-01T00:00:00",
      },
    ];

    for (const { datePartType, expected, format, value } of cases)
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
