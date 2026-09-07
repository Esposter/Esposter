import { columnTransformationSchema } from "#shared/models/resource/sheet/column/transformation/ColumnTransformation";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { describe, expect, test } from "vitest";

describe("columnTransformationSchema", () => {
  test("has an arm for every transformation type", () => {
    expect.hasAssertions();

    expect(new Set(columnTransformationSchema.options.map((option) => option.shape.type.unwrap().value))).toStrictEqual(
      new Set(Object.values(ColumnTransformationType)),
    );
  });
});
