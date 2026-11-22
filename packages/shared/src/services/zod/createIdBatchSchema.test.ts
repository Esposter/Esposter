import { MAX_READ_LIMIT } from "#src/services/app/constants";
import { createIdBatchSchema } from "#src/services/zod/createIdBatchSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(createIdBatchSchema, () => {
  const schema = createIdBatchSchema(z.string());

  test("accepts a batch of unique ids", () => {
    expect.hasAssertions();
    expect(schema.safeParse(["", " "]).success).toBe(true);
  });

  test("refuses an empty batch", () => {
    expect.hasAssertions();
    expect(schema.safeParse([]).success).toBe(false);
  });

  test("refuses a batch past the read limit", () => {
    expect.hasAssertions();
    expect(schema.safeParse(Array.from({ length: MAX_READ_LIMIT + 1 }, (_value, index) => `${index}`)).success).toBe(
      false,
    );
  });
});
