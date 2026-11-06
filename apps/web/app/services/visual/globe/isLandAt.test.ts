import type { LandMask } from "@/models/visual/LandMask";

import { isLandAt } from "@/services/visual/globe/isLandAt";
import { describe, expect, test } from "vitest";

describe(isLandAt, () => {
  // One cell per degree, with land only in the square from 0 to 1 degree north and east
  const landMask: LandMask = {
    cellsPerDegree: 1,
    rows: Array.from({ length: 180 }, (_, i) => (i === 89 ? [180, 181] : [])),
  };

  test("a point inside a land cell is land", () => {
    expect.hasAssertions();

    expect(isLandAt(landMask, 0.5, 0.5)).toBe(true);
  });

  test("a point beside a land cell is sea", () => {
    expect.hasAssertions();

    expect(isLandAt(landMask, 0.5, 1.5)).toBe(false);
  });

  test("a longitude past the antimeridian wraps round", () => {
    expect.hasAssertions();

    expect(isLandAt(landMask, 0.5, 360.5)).toBe(true);
  });

  test("a pole is read from its edge row", () => {
    expect.hasAssertions();

    expect(isLandAt(landMask, 90, 0.5)).toBe(false);
  });
});
