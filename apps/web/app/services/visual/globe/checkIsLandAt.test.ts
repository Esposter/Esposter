import { checkIsLandAt } from "#src/services/visual/globe/checkIsLandAt";
import { TEST_LAND_MASK } from "#src/services/visual/globe/constants.test";
import { describe, expect, test } from "vitest";

describe(checkIsLandAt, () => {
  test("a point inside a land cell is land", () => {
    expect.hasAssertions();

    expect(checkIsLandAt(TEST_LAND_MASK, 0.5, 0.5)).toBe(true);
  });

  test("a point beside a land cell is sea", () => {
    expect.hasAssertions();

    expect(checkIsLandAt(TEST_LAND_MASK, 0.5, 1.5)).toBe(false);
  });

  test("a longitude past the antimeridian wraps round", () => {
    expect.hasAssertions();

    expect(checkIsLandAt(TEST_LAND_MASK, 0.5, 360.5)).toBe(true);
  });

  test("a pole is read from its edge row", () => {
    expect.hasAssertions();

    expect(checkIsLandAt(TEST_LAND_MASK, 90, 0.5)).toBe(false);
  });
});
