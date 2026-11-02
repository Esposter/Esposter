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

  test.each([
    ["a backreference", "(a)\\1", "RE2 cannot run this pattern: error parsing regexp: invalid escape sequence: `\\1`"],
    [
      "a lookahead",
      "a(?=b)",
      "RE2 cannot run this pattern: error parsing regexp: invalid or unsupported Perl syntax: `(?=`",
    ],
  ])("refuses a pattern RE2 cannot run, %s", (_title, pattern, message) => {
    expect.hasAssertions();

    const result = columnTransformationFormSchema.safeParse({
      groupIndex: 1,
      pattern,
      sourceColumnId: "",
      type: ColumnTransformationType.RegexMatch,
    });

    expect(result.error?.issues.map((issue) => issue.message)).toStrictEqual([message]);
  });

  test("keeps a stored pattern RE2 cannot run loadable, the column reads empty", () => {
    expect.hasAssertions();

    const stored = { groupIndex: 1, pattern: "(a)\\1", sourceColumnId: "", type: ColumnTransformationType.RegexMatch };

    expect(columnTransformationSchema.safeParse(stored).success).toBe(true);
  });
});
