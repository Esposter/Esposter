import { createUniqueArraySchema } from "@/util/zod/createUniqueArraySchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(createUniqueArraySchema, () => {
  const primitiveSchema = createUniqueArraySchema(z.string());
  const objectSchema = createUniqueArraySchema(z.object({ id: z.string() }), "id");

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
});
