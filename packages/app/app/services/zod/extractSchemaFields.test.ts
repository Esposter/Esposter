import { extractSchemaFields } from "@/services/zod/extractSchemaFields";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(extractSchemaFields, () => {
  const name = "name";

  // The form renders the schema, so anything the source carries beyond it is state vjsf has no field for —
  // Handing it over makes the form's own value differ from what it can edit, which reads back as a change
  test("keeps only the fields the schema declares", () => {
    expect.hasAssertions();

    const schema = z.object({ name: z.string() });

    expect(extractSchemaFields(schema, { name, other: "other" })).toStrictEqual({ name });
  });

  // A declared field the source has nothing for is still the form's field, so it comes back present and empty
  // Rather than absent — vjsf renders what the value object has
  test("keeps a declared field the source is missing", () => {
    expect.hasAssertions();

    const schema = z.object({ name: z.string(), notes: z.string() });

    expect(extractSchemaFields(schema, { name })).toStrictEqual({ name, notes: undefined });
  });

  // The projection is not a validation boundary: applying the schema here would rewrite the value the user is
  // About to edit, so a default fills nothing in and a transform runs on submit instead
  test("applies neither the schema's defaults nor its transforms", () => {
    expect.hasAssertions();

    const schema = z.object({
      name: z.string().transform((value) => value.toUpperCase()),
      notes: z.string().default(""),
    });

    expect(extractSchemaFields(schema, { name })).toStrictEqual({ name, notes: undefined });
  });
});
