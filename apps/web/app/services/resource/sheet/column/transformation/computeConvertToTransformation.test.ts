import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { computeConvertToTransformation } from "@/services/resource/sheet/column/transformation/computeConvertToTransformation";
import { describe, expect, test } from "vitest";

// The coercion matrix lives in coerceValue.test.ts; here only the wiring and the string passthrough branch
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
});
