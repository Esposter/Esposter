import { BooleanValue } from "#shared/models/tableEditor/file/column/BooleanValue";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { computeConvertToTransformation } from "@/services/tableEditor/file/column/transformation/computeConvertToTransformation";
import { describe, expect, test } from "vitest";

describe(computeConvertToTransformation, () => {
  test("converts string to number", () => {
    expect.hasAssertions();
    expect(
      computeConvertToTransformation("0.1", {
        sourceColumnId: "",
        targetType: ColumnType.Number,
        type: ColumnTransformationType.ConvertTo,
      }),
    ).toBe(0.1);
  });

  test("converts string to boolean", () => {
    expect.hasAssertions();
    expect(
      computeConvertToTransformation(BooleanValue.True, {
        sourceColumnId: "",
        targetType: ColumnType.Boolean,
        type: ColumnTransformationType.ConvertTo,
      }),
    ).toBe(true);
    expect(
      computeConvertToTransformation(BooleanValue.False, {
        sourceColumnId: "",
        targetType: ColumnType.Boolean,
        type: ColumnTransformationType.ConvertTo,
      }),
    ).toBe(false);
  });

  test("returns null for empty string", () => {
    expect.hasAssertions();
    expect(
      computeConvertToTransformation("", {
        sourceColumnId: "",
        targetType: ColumnType.Number,
        type: ColumnTransformationType.ConvertTo,
      }),
    ).toBeNull();
  });

  test("returns null for NaN input", () => {
    expect.hasAssertions();
    expect(
      computeConvertToTransformation(String(Number.NaN), {
        sourceColumnId: "",
        targetType: ColumnType.Number,
        type: ColumnTransformationType.ConvertTo,
      }),
    ).toBeNull();
  });

  test("passes string through as string", () => {
    expect.hasAssertions();
    expect(
      computeConvertToTransformation(" ", {
        sourceColumnId: "",
        targetType: ColumnType.String,
        type: ColumnTransformationType.ConvertTo,
      }),
    ).toBe(" ");
  });

  test("passes date string through as string", () => {
    expect.hasAssertions();
    expect(
      computeConvertToTransformation("1970-01-01", {
        sourceColumnId: "",
        targetType: ColumnType.Date,
        type: ColumnTransformationType.ConvertTo,
      }),
    ).toBe("1970-01-01");
  });
});
