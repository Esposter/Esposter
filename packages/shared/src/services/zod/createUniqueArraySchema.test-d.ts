import { createUniqueArraySchema } from "#src/services/zod/createUniqueArraySchema";
import { describe, expect, expectTypeOf, test } from "vitest";
import { z } from "zod";

describe("createUniqueArraySchema type", () => {
  test("object", () => {
    expect.hasAssertions();

    expectTypeOf<ReturnType<typeof createUniqueArraySchema<z.ZodObject<{ id: z.ZodString }>>>>().toEqualTypeOf<
      z.ZodArray<z.ZodObject<{ id: z.ZodString }>>
    >();
  });

  test("refuses a key on primitive items", () => {
    expect.hasAssertions();

    // @ts-expect-error an array of primitives is unique by its items, so the keyed form takes objects only
    expectTypeOf(createUniqueArraySchema).toBeCallableWith(z.string(), "length");
  });
});
