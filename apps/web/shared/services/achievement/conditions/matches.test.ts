import { matches } from "#shared/services/achievement/conditions/matches";
import { describe, expect, test } from "vitest";

describe(matches, () => {
  test("matches a pattern, and an absent value never", () => {
    expect.hasAssertions();

    const isLowercase = matches(/^[a-z]+$/u);

    expect(isLowercase("abc")).toBe(true);
    expect(isLowercase("ABC")).toBe(false);
    expect(isLowercase(undefined)).toBe(false);
  });
});
