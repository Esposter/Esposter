import { createUniquePrimitiveArraySchema } from "#src/services/zod/createUniquePrimitiveArraySchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(createUniquePrimitiveArraySchema, () => {
  const primitiveSchema = createUniquePrimitiveArraySchema(z.string());

  test("accepts unique primitive items and rejects a repeated one", () => {
    expect.hasAssertions();
    expect(primitiveSchema.safeParse(["", " "]).success).toBe(true);
    expect(primitiveSchema.safeParse(["", ""]).success).toBe(false);
  });
});
