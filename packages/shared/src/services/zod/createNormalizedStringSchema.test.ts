import { createNormalizedStringSchema } from "#src/services/zod/createNormalizedStringSchema";
import { describe, expect, test } from "vitest";

describe(createNormalizedStringSchema, () => {
  test("trims whitespace before validating", () => {
    expect.hasAssertions();

    expect(createNormalizedStringSchema(5).parse(" a ")).toBe("a");
    expect(createNormalizedStringSchema(5).parse(" ")).toBe("");
  });
});
