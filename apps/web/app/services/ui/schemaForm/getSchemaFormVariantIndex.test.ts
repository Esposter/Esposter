import type { JsonSchema } from "@jsonforms/core";

import { getSchemaFormVariantIndex } from "@/services/ui/schemaForm/getSchemaFormVariantIndex";
import { describe, expect, test } from "vitest";

describe(getSchemaFormVariantIndex, () => {
  const a: JsonSchema = { properties: { name: { type: "string" }, type: { const: "a" } } };
  const b: JsonSchema = { properties: { name: { type: "string" }, type: { const: "b" } } };

  test("is the variant whose fixed discriminant the data carries, whatever else the data holds", () => {
    expect.hasAssertions();

    expect(getSchemaFormVariantIndex({ id: "id", name: "", type: "b" }, [a, b])).toBe(1);
  });

  test("is the first variant while the data carries no discriminant, or is no object", () => {
    expect.hasAssertions();

    expect(getSchemaFormVariantIndex({ name: "" }, [a, b])).toBe(0);
    expect(getSchemaFormVariantIndex(undefined, [a, b])).toBe(0);
  });

  test("is JSON Forms' pick for a union with no fixed discriminant, and the first where it picked none", () => {
    expect.hasAssertions();

    const first: JsonSchema = { properties: { name: { type: "string" } } };
    const second: JsonSchema = { properties: { size: { type: "number" } } };

    expect(getSchemaFormVariantIndex({ size: 1 }, [first, second], 1)).toBe(1);
    expect(getSchemaFormVariantIndex({ size: 1 }, [first, second], -1)).toBe(0);
    expect(getSchemaFormVariantIndex({ size: 1 }, [first, second], Number.NaN)).toBe(0);
  });
});
