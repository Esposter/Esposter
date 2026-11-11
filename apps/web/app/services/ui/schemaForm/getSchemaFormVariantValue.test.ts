import type { JsonSchema } from "@jsonforms/core";

import { getSchemaFormVariantValue } from "@/services/ui/schemaForm/getSchemaFormVariantValue";
import { describe, expect, test } from "vitest";

const createPickerVariant = (type: string, itemsKey: string): JsonSchema => {
  const sourceColumnId = { layout: { itemsKey }, type: "string" };
  return { properties: { sourceColumnId, type: { const: type } } };
};

describe(getSchemaFormVariantValue, () => {
  const a: JsonSchema = { properties: { a: { type: "string" }, name: { type: "string" }, type: { const: "a" } } };
  const b: JsonSchema = { properties: { b: { type: "string" }, name: { type: "string" }, type: { const: "b" } } };

  test("keeps the shared fields and what no variant describes, drops the old variant's own and fixes the discriminant", () => {
    expect.hasAssertions();

    expect(getSchemaFormVariantValue({ a: "a", id: "id", name: "name", type: "a" }, [a, b], b, b)).toStrictEqual({
      id: "id",
      name: "name",
      type: "b",
    });
  });

  test("reads the variant the data is in from the fitting index when the union has no fixed discriminant", () => {
    expect.hasAssertions();

    const stringsVariant: JsonSchema = {
      properties: { col: { layout: { itemsKey: "strings" }, type: "number" }, n: { type: "number" } },
    };
    const numbersVariant: JsonSchema = {
      properties: { col: { layout: { itemsKey: "numbers" }, type: "number" }, size: { type: "number" } },
    };

    expect(
      getSchemaFormVariantValue(
        { col: 5, size: 1 },
        [stringsVariant, numbersVariant],
        stringsVariant,
        stringsVariant,
        1,
      ),
    ).toStrictEqual({});
  });

  test("drops a picked field whose picker reads another list of the context, and keeps it where the list is the same", () => {
    expect.hasAssertions();

    const sourceColumnId = "sourceColumnId";
    const firstListVariant = createPickerVariant("a", "");
    const secondListVariant = createPickerVariant("b", " ");
    const otherSecondListVariant = createPickerVariant("c", " ");
    const variants = [firstListVariant, secondListVariant, otherSecondListVariant];

    expect(
      getSchemaFormVariantValue({ sourceColumnId, type: "a" }, variants, secondListVariant, secondListVariant),
    ).toStrictEqual({ type: "b" });
    expect(
      getSchemaFormVariantValue(
        { sourceColumnId, type: "b" },
        variants,
        otherSecondListVariant,
        otherSecondListVariant,
      ),
    ).toStrictEqual({ sourceColumnId, type: "c" });
  });
});
