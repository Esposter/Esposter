import { createUniqueArraySchema } from "@/util/zod/createUniqueArraySchema";
import { describe, expect, expectTypeOf, test } from "vitest";
import { z } from "zod";

describe("createUniqueArraySchema type", () => {
  test("primitive", () => {
    expect.hasAssertions();

    expectTypeOf<ReturnType<typeof createUniqueArraySchema<z.ZodString>>>().toEqualTypeOf<z.ZodArray<z.ZodString>>();
  });

  test("object", () => {
    expect.hasAssertions();

    expectTypeOf<
      ReturnType<
        typeof createUniqueArraySchema<
          { id: string },
          { id: string },
          z.ZodObject<{
            id: z.ZodString;
          }>
        >
      >
    >().toEqualTypeOf<
      z.ZodArray<
        z.ZodObject<{
          id: z.ZodString;
        }>
      >
    >();
  });

  test("generic object", () => {
    expect.hasAssertions();

    expectTypeOf<
      z.output<
        ReturnType<
          typeof createUniqueArraySchema<
            { id: string },
            unknown,
            z.ZodType<{
              id: string;
            }>
          >
        >
      >
    >().toEqualTypeOf<{ id: string }[]>();
  });

  test("generic mapped object", () => {
    expect.hasAssertions();

    expectTypeOf<
      z.output<
        ReturnType<
          typeof createUniqueArraySchema<
            { id: "id" },
            { id: "id" },
            z.ZodObject<{
              id: z.ZodLiteral<"id">;
            }>
          >
        >
      >
    >().toEqualTypeOf<{ id: "id" }[]>();
  });
});
