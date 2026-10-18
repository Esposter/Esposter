import { gainImaginariumRerolls } from "#src/services/imaginarium/gainImaginariumRerolls";
import { describe, expect, test } from "vitest";

describe(gainImaginariumRerolls, () => {
  test("a Mystery Cache's reroll option gives two chances", () => {
    expect.hasAssertions();

    expect(gainImaginariumRerolls(0)).toBe(2);
  });
});
