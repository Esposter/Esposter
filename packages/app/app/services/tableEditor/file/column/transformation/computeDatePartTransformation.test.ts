import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { DatePartType } from "#shared/models/tableEditor/file/column/transformation/DatePartType";
import { computeDatePartTransformation } from "@/services/tableEditor/file/column/transformation/computeDatePartTransformation";
import { describe, expect, test } from "vitest";

describe(computeDatePartTransformation, () => {
  test("extracts year", () => {
    expect.hasAssertions();
    expect(
      computeDatePartTransformation("1970-01-01", {
        inputFormat: "YYYY-MM-DD",
        part: DatePartType.Year,
        sourceColumnId: "",
        type: ColumnTransformationType.DatePart,
      }),
    ).toBe(1970);
  });

  test("extracts month (1-indexed)", () => {
    expect.hasAssertions();
    expect(
      computeDatePartTransformation("1970-01-01", {
        inputFormat: "YYYY-MM-DD",
        part: DatePartType.Month,
        sourceColumnId: "",
        type: ColumnTransformationType.DatePart,
      }),
    ).toBe(1);
  });

  test("extracts day", () => {
    expect.hasAssertions();
    expect(
      computeDatePartTransformation("1970-01-02", {
        inputFormat: "YYYY-MM-DD",
        part: DatePartType.Day,
        sourceColumnId: "",
        type: ColumnTransformationType.DatePart,
      }),
    ).toBe(2);
  });

  test("extracts hour", () => {
    expect.hasAssertions();
    expect(
      computeDatePartTransformation("1970-01-01T00:00:00", {
        inputFormat: "YYYY-MM-DDTHH:mm:ss",
        part: DatePartType.Hour,
        sourceColumnId: "",
        type: ColumnTransformationType.DatePart,
      }),
    ).toBe(0);
  });

  test("extracts minute", () => {
    expect.hasAssertions();
    expect(
      computeDatePartTransformation("1970-01-01T00:00:00", {
        inputFormat: "YYYY-MM-DDTHH:mm:ss",
        part: DatePartType.Minute,
        sourceColumnId: "",
        type: ColumnTransformationType.DatePart,
      }),
    ).toBe(0);
  });

  test("returns null for invalid date", () => {
    expect.hasAssertions();
    expect(
      computeDatePartTransformation("not-a-date", {
        inputFormat: "YYYY-MM-DD",
        part: DatePartType.Year,
        sourceColumnId: "",
        type: ColumnTransformationType.DatePart,
      }),
    ).toBeNull();
  });

  test("returns null for non-string value", () => {
    expect.hasAssertions();
    expect(
      computeDatePartTransformation(0, {
        inputFormat: "YYYY-MM-DD",
        part: DatePartType.Year,
        sourceColumnId: "",
        type: ColumnTransformationType.DatePart,
      }),
    ).toBeNull();
  });
});
