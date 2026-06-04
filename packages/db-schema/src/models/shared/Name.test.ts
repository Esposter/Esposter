import { createNameSchema } from "@/models/shared/Name";
import { describe, expect, test } from "vitest";

describe(createNameSchema, () => {
  test("trims whitespace before validating", () => {
    expect.hasAssertions();

    expect(createNameSchema(5).parse(" a ")).toBe("a");
    expect(createNameSchema(5).safeParse(" ").success).toBe(false);
    expect(createNameSchema(5).safeParse("").success).toBe(false);
  });
});
