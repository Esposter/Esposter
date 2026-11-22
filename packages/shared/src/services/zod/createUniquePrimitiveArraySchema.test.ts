import { createUniquePrimitiveArraySchema } from "#src/services/zod/createUniquePrimitiveArraySchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(createUniquePrimitiveArraySchema, () => {
  const primitiveSchema = createUniquePrimitiveArraySchema(z.string());

  test("accepts unique primitive items", () => {
    expect.hasAssertions();
    expect(primitiveSchema.safeParse(["", " "]).success).toBe(true);
  });

  test("rejects duplicate primitive items", () => {
    expect.hasAssertions();
    expect(primitiveSchema.safeParse(["", ""]).success).toBe(false);
  });
});
