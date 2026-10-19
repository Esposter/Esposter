import { styleValueSchema } from "#shared/models/pageBuilder/StyleValue";
import { describe, expect, test } from "vitest";

describe(styleValueSchema, () => {
  test.each(["red; /*", "red */", "red; }", "red{", "<b>"])(
    "%j is refused so it cannot end or comment out its rule",
    (value) => {
      expect.hasAssertions();

      expect(styleValueSchema.safeParse(value).success).toBe(false);
    },
  );

  test("a plain value is accepted", () => {
    expect.hasAssertions();

    expect(styleValueSchema.safeParse("1px solid red").success).toBe(true);
  });
});
