import { columnTransformationSchema } from "#shared/models/resource/sheet/column/transformation/ColumnTransformation";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { columnTransformationFormSchema } from "@/models/resource/sheet/column/transformation/ColumnTransformationForm";
import { describe, expect, test } from "vitest";

describe("columnTransformationFormSchema", () => {
  test("mirrors every arm of the schema the server parses", () => {
    expect.hasAssertions();

    expect(columnTransformationFormSchema.options.map((option) => option.shape.type.unwrap().value)).toStrictEqual(
      columnTransformationSchema.options.map((option) => option.shape.type.unwrap().value),
    );
  });

  test("keeps the refinements of the schema the server parses", () => {
    expect.hasAssertions();

    const transformation = { type: ColumnTransformationType.Math, variables: [] };

    expect(columnTransformationFormSchema.safeParse({ ...transformation, expression: "1 + 1" }).success).toBe(true);
    expect(columnTransformationFormSchema.safeParse({ ...transformation, expression: "1 +" }).success).toBe(false);
  });
});
