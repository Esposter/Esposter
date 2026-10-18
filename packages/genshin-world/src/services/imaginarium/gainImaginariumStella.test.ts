import { gainImaginariumStella } from "#src/services/imaginarium/gainImaginariumStella";
import { describe, expect, test } from "vitest";

describe(gainImaginariumStella, () => {
  test("meeting an act's star challenge gives one Stella", () => {
    expect.hasAssertions();

    expect(gainImaginariumStella(0, true)).toBe(1);
  });

  test("an unmet star challenge gives no Stella", () => {
    expect.hasAssertions();

    expect(gainImaginariumStella(0, false)).toBe(0);
  });
});
