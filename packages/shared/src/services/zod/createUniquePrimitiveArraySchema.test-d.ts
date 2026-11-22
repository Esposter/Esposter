import { createUniquePrimitiveArraySchema } from "#src/services/zod/createUniquePrimitiveArraySchema";
import { describe, expect, expectTypeOf, test } from "vitest";
import { z } from "zod";

describe("createUniquePrimitiveArraySchema type", () => {
  test("object", () => {
    expect.hasAssertions();

    // @ts-expect-error a Set compares items by reference, so an object schema is unique only against a key
    expectTypeOf(createUniquePrimitiveArraySchema).toBeCallableWith(z.object({ id: z.string() }));
  });
});
