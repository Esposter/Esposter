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

    const transformation = { sourceColumnIds: [], type: ColumnTransformationType.StringPattern };

    expect(columnTransformationFormSchema.safeParse({ ...transformation, pattern: "" }).success).toBe(true);
    expect(columnTransformationFormSchema.safeParse({ ...transformation, pattern: "{0}" }).success).toBe(false);
  });

  test.each([
    ["Expression that cannot be parsed", "1 +", ["Unexpected end of expression (char 4)"]],
    ["Expression naming an unbound column", "a + b", ['Unknown variable "b"']],
  ])("%s", (_title, expression, messages) => {
    expect.hasAssertions();

    const result = columnTransformationFormSchema.safeParse({
      expression,
      type: ColumnTransformationType.Math,
      variables: [{ name: "a", sourceColumnId: "" }],
    });

    expect(result.error?.issues.map(({ message }) => message)).toStrictEqual(messages);
  });
});
