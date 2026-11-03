import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { surveyTextNodeType } from "#src/services/surveyTextNodeType";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyTextNodeType", () => {
  const nodeSchema = z.strictObject({ ...surveyTextNodeType.propsSchema.shape, id: surveyIdSchema });

  test("a text question made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const result = nodeSchema.safeParse({ ...surveyTextNodeType.createDefaultProps(), id: crypto.randomUUID() });

    expect(result.success).toBe(true);
  });

  test("a prop the text question does not declare is refused", () => {
    expect.hasAssertions();

    const result = nodeSchema.safeParse({
      ...surveyTextNodeType.createDefaultProps(),
      content: "",
      id: crypto.randomUUID(),
    });

    expect(result.error?.issues.map(({ code }) => code)).toStrictEqual(["unrecognized_keys"]);
  });

  test("an input type outside the list is refused", () => {
    expect.hasAssertions();

    const result = nodeSchema.safeParse({
      ...surveyTextNodeType.createDefaultProps(),
      id: crypto.randomUUID(),
      inputType: "",
    });

    expect(result.error?.issues.map(({ path }) => path)).toStrictEqual([["inputType"]]);
  });

  test("a name holding a brace is refused", () => {
    expect.hasAssertions();

    const result = nodeSchema.safeParse({
      ...surveyTextNodeType.createDefaultProps(),
      id: crypto.randomUUID(),
      name: "{",
    });

    expect(result.error?.issues.map(({ path }) => path)).toStrictEqual([["name"]]);
  });
});
