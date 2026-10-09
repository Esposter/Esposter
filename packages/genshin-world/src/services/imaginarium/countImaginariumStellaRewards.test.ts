import { countImaginariumStellaRewards } from "#src/services/imaginarium/countImaginariumStellaRewards";
import { describe, expect, test } from "vitest";

describe(countImaginariumStellaRewards, () => {
  test("should give one reward for every three Stellas", () => {
    expect.hasAssertions();

    expect(countImaginariumStellaRewards(2)).toBe(0);
    expect(countImaginariumStellaRewards(5)).toBe(1);
    expect(countImaginariumStellaRewards(6)).toBe(2);
  });
});
