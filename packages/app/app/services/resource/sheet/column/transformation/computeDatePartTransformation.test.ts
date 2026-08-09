import type { DatePartTransformation } from "#shared/models/resource/sheet/column/transformation/DatePartTransformation";

import { DateFormat } from "#shared/models/resource/sheet/column/DateFormat";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { DatePartType } from "#shared/models/resource/sheet/column/transformation/DatePartType";
import { computeDatePartTransformation } from "@/services/resource/sheet/column/transformation/computeDatePartTransformation";
import { describe, expect, test } from "vitest";

describe(computeDatePartTransformation, () => {
  const createTransformation = (part: DatePartType): DatePartTransformation => ({
    part,
    sourceColumnId: "",
    type: ColumnTransformationType.DatePart,
  });

  test("extracts each date part from its source format", () => {
    expect.hasAssertions();

    // Month is 1-indexed and weekday is 0-indexed from Sunday
    const cases: { expected: number; format: DateFormat; part: DatePartType; value: string }[] = [
      { expected: 1970, format: DateFormat["YYYY-MM-DD"], part: DatePartType.Year, value: "1970-01-01" },
      { expected: 1, format: DateFormat["YYYY-MM-DD"], part: DatePartType.Month, value: "1970-01-01" },
      { expected: 2, format: DateFormat["YYYY-MM-DD"], part: DatePartType.Day, value: "1970-01-02" },
      { expected: 4, format: DateFormat["YYYY-MM-DD"], part: DatePartType.Weekday, value: "1970-01-01" },
      {
        expected: 0,
        format: DateFormat["YYYY-MM-DDTHH:mm:ss"],
        part: DatePartType.Hour,
        value: "1970-01-01T00:00:00",
      },
      {
        expected: 0,
        format: DateFormat["YYYY-MM-DDTHH:mm:ss"],
        part: DatePartType.Minute,
        value: "1970-01-01T00:00:00",
      },
    ];

    for (const { expected, format, part, value } of cases)
      expect(computeDatePartTransformation(value, createTransformation(part), format)).toBe(expected);
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
