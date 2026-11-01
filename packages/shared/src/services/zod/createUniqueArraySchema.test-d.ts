import { createUniqueArraySchema } from "#src/services/zod/createUniqueArraySchema";
import { describe, expect, expectTypeOf, test } from "vitest";
import { z } from "zod";

describe("createUniqueArraySchema type", () => {
  test("primitive", () => {
    expect.hasAssertions();

    expectTypeOf(createUniqueArraySchema(z.string())).toEqualTypeOf<z.ZodArray<z.ZodString>>();
  });

  test("object", () => {
    expect.hasAssertions();

    expectTypeOf(createUniqueArraySchema(z.object({ id: z.string() }), "id")).toEqualTypeOf<
      z.ZodArray<z.ZodObject<{ id: z.ZodString }>>
    >();
  });

  test("object without a key", () => {
    expect.hasAssertions();

    // @ts-expect-error a Set compares items by reference, so an object schema is unique only against a key
    expectTypeOf(createUniqueArraySchema).toBeCallableWith(z.object({ id: z.string() }));
  });
});
