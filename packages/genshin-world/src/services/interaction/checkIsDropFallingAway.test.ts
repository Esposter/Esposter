import { checkIsDropFallingAway } from "#src/services/interaction/checkIsDropFallingAway";
import { describe, expect, test } from "vitest";

describe(checkIsDropFallingAway, () => {
  const WATER_LEVEL = 2;

  test("a drop falls away where the ground gives no height", () => {
    expect.hasAssertions();

    expect(checkIsDropFallingAway(Number.NaN, WATER_LEVEL)).toBe(true);
  });

  test("a drop falls away where the ground lies below the water level", () => {
    expect.hasAssertions();

    expect(checkIsDropFallingAway(WATER_LEVEL - 1, WATER_LEVEL)).toBe(true);
  });

  test("a drop stays where the ground lies at or above the water level", () => {
    expect.hasAssertions();

    expect(checkIsDropFallingAway(WATER_LEVEL, WATER_LEVEL)).toBe(false);
    expect(checkIsDropFallingAway(WATER_LEVEL + 1, WATER_LEVEL)).toBe(false);
  });
});
