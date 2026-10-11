import { equals } from "#shared/services/achievement/conditions/equals";
import { describe, expect, test } from "vitest";

describe(equals, () => {
  test("matches only the expected value", () => {
    expect.hasAssertions();

    const isOne = equals(1);

    expect(isOne(1)).toBe(true);
    expect(isOne(-1)).toBe(false);
  });
});
