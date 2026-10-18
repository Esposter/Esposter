import { createUniqueArraySchema } from "#src/services/zod/createUniqueArraySchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(createUniqueArraySchema, () => {
  const primitiveSchema = createUniqueArraySchema(z.string());
  const objectSchema = createUniqueArraySchema(z.object({ id: z.string() }), "id");
  const compositeObjectSchema = createUniqueArraySchema(z.object({ first: z.string(), second: z.string() }), [
    "first",
    "second",
  ]);

  test("accepts unique primitive items", () => {
    expect.hasAssertions();
    expect(primitiveSchema.safeParse(["", " "]).success).toBe(true);
  });

  test("rejects duplicate primitive items", () => {
    expect.hasAssertions();
    expect(primitiveSchema.safeParse(["", ""]).success).toBe(false);
  });

  test("accepts unique object items by key", () => {
    expect.hasAssertions();
    expect(objectSchema.safeParse([{ id: "" }, { id: " " }]).success).toBe(true);
  });

  test("rejects duplicate object items by key", () => {
    expect.hasAssertions();
    expect(objectSchema.safeParse([{ id: "" }, { id: "" }]).success).toBe(false);
  });

  test("accepts object items that share a part of their composite key", () => {
    expect.hasAssertions();
    expect(
      compositeObjectSchema.safeParse([
        { first: "", second: "" },
        { first: "", second: " " },
      ]).success,
    ).toBe(true);
  });

  test("rejects duplicate object items by composite key", () => {
    expect.hasAssertions();
    expect(
      compositeObjectSchema.safeParse([
        { first: "", second: "" },
        { first: "", second: "" },
      ]).success,
    ).toBe(false);
  });
});
