import type { LandMask } from "@/models/visual/LandMask";

import { createLandDots } from "@/services/visual/globe/createLandDots";
import { describe, expect, test } from "vitest";

describe(createLandDots, () => {
  // One cell per degree, with land only in the square from 0 to 1 degree north and east
  const landMask: LandMask = {
    cellsPerDegree: 1,
    rows: Array.from({ length: 180 }, (_value, i) => (i === 89 ? [180, 181] : [])),
  };

  test("dots stand on land only", () => {
    expect.hasAssertions();

    const dots = createLandDots(landMask, 0.25);

    expect(dots.length).toBeGreaterThan(0);
    expect(dots.every(({ lat, lng }) => lat >= 0 && lat < 1 && lng >= 0 && lng < 1)).toBe(true);
  });

  test("a wider spacing draws fewer dots", () => {
    expect.hasAssertions();

    expect(createLandDots(landMask, 0.5)).toHaveLength(4);
    expect(createLandDots(landMask, 0.25).length).toBeGreaterThan(4);
  });
});
