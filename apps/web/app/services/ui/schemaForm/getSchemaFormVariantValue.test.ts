import type { JsonSchema } from "@jsonforms/core";

import { getSchemaFormVariantValue } from "@/services/ui/schemaForm/getSchemaFormVariantValue";
import { describe, expect, test } from "vitest";

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
});
