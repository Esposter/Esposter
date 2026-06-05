import { createUniqueArraySchema } from "@/util/zod/createUniqueArraySchema";
import { describe, expect, expectTypeOf, test } from "vitest";
import { z } from "zod";

const createGenericIdArraySchema = <TOutput extends { id: string }, TInput = TOutput>(
  schema: z.ZodType<TOutput, TInput>,
) => createUniqueArraySchema(schema, "id");

const createGenericMappedIdArraySchema = <T extends z.ZodType<string>>(schema: T) =>
  createUniqueArraySchema(z.object({ id: schema }), "id");

describe("createUniqueArraySchema type", () => {
  test("primitive", () => {
    expect.hasAssertions();

    expectTypeOf(createUniqueArraySchema(z.string())).toEqualTypeOf<z.ZodArray<z.ZodString>>();

    // @ts-expect-error Primitive arrays cannot be keyed.
    createUniqueArraySchema(z.string(), "id");
  });

  test("object", () => {
    expect.hasAssertions();

    const schema = z.object({ id: z.string() });

    expectTypeOf(createUniqueArraySchema(schema, "id")).toEqualTypeOf<z.ZodArray<typeof schema>>();

    // @ts-expect-error Object keys must exist on the schema shape.
    createUniqueArraySchema(schema, "missing");
  });

  test("generic object", () => {
    expect.hasAssertions();

    const schema = z.object({ id: z.string() });
    const _arraySchema = createGenericIdArraySchema(schema);

    expectTypeOf<z.output<typeof _arraySchema>>().toEqualTypeOf<z.output<typeof schema>[]>();
  });

  test("generic mapped object", () => {
    expect.hasAssertions();

    const schema = z.literal("id");
    const _arraySchema = createGenericMappedIdArraySchema(schema);

    expectTypeOf<z.output<typeof _arraySchema>>().toEqualTypeOf<{ id: "id" }[]>();
  });
});
