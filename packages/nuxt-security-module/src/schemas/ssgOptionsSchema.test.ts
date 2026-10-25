import { ssgOptionsSchema } from "#src/schemas/ssgOptionsSchema";
import { describe, expect, test } from "vitest";

describe(ssgOptionsSchema, () => {
  test("refuses the two options the module does not read", () => {
    expect.hasAssertions();

    expect(
      ssgOptionsSchema.safeParse({
        exportToPresets: true,
        hashScripts: true,
        hashStyles: false,
        meta: true,
        nitroHeaders: true,
      }).success,
    ).toBe(false);
  });
});
