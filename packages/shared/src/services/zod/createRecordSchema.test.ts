import { createRecordSchema } from "#src/services/zod/createRecordSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(createRecordSchema, () => {
  const maxEntries = 2;
  const schema = createRecordSchema(z.string(), z.number(), maxEntries);

  test("accepts a record at its cap", () => {
    expect.hasAssertions();
    expect(schema.safeParse({ a: 1, b: 2 }).success).toBe(true);
  });

  test("rejects a record past its cap", () => {
    expect.hasAssertions();
    expect(schema.safeParse({ a: 1, b: 2, c: 3 }).success).toBe(false);
  });

  test("still checks its keys and values", () => {
    expect.hasAssertions();
    expect(schema.safeParse({ a: "1" }).success).toBe(false);
  });

  test("carries its cap into the JSON Schema", () => {
    expect.hasAssertions();
    expect(z.toJSONSchema(schema, { io: "output" }).maxProperties).toBe(maxEntries);
  });
});
