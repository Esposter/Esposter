import { createNameSchema } from "#src/models/shared/Name";
import { describe, expect, test } from "vitest";

describe(createNameSchema, () => {
  const schema = createNameSchema(1);

  test("trims whitespace before validating", () => {
    expect.hasAssertions();

    expect(schema.parse(" a ")).toBe("a");
    expect(schema.safeParse(" ").success).toBe(false);
    expect(schema.safeParse("").success).toBe(false);
  });
});
