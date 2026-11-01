import { checkIsInSightReach } from "#src/services/elementalSight/checkIsInSightReach";
import { SIGHT_REACH } from "#src/services/elementalSight/constants";
import { createSight } from "#src/services/elementalSight/createSight.test";
import { describe, expect, test } from "vitest";

describe(checkIsInSightReach, () => {
  test("a point is in reach within the range the sight has spread to, and out of it beyond", () => {
    expect.hasAssertions();

    expect(checkIsInSightReach(createSight(0), { x: 0, z: 0 })).toBe(true);
    expect(checkIsInSightReach(createSight(0), { x: 1, z: 0 })).toBe(false);
    expect(checkIsInSightReach(createSight(Infinity), { x: SIGHT_REACH, z: 0 })).toBe(true);
    expect(checkIsInSightReach(createSight(Infinity), { x: SIGHT_REACH + 1, z: 0 })).toBe(false);
  });
});
