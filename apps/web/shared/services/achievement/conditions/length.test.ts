import { isAtLeast } from "#shared/services/achievement/conditions/isAtLeast";
import { length } from "#shared/services/achievement/conditions/length";
import { describe, expect, test } from "vitest";

describe(length, () => {
  test("tests the length of a present value, and an absent one never", () => {
    expect.hasAssertions();

    const isTwoOrMore = length(isAtLeast(2));

    expect(isTwoOrMore("ab")).toBe(true);
    expect(isTwoOrMore("a")).toBe(false);
    expect(isTwoOrMore(undefined)).toBe(false);
  });
});
