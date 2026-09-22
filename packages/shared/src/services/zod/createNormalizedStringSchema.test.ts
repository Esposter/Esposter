import { createNormalizedStringSchema } from "#src/services/zod/createNormalizedStringSchema";
import { describe, expect, test } from "vitest";

describe(createNormalizedStringSchema, () => {
  const schema = createNormalizedStringSchema(1);

  test("trims whitespace before validating", () => {
    expect.hasAssertions();

    expect(schema.parse(" a ")).toBe("a");
    expect(schema.parse(" ")).toBe("");
  });
});
