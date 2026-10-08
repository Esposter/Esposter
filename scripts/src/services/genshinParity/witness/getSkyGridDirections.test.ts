import { getSkyGridDirections } from "#src/services/genshinParity/witness/getSkyGridDirections";
import { MathUtils } from "three";
import { describe, expect, test } from "vitest";

describe(getSkyGridDirections, () => {
  test("lays a direction at each of 36 azimuths by each of 12 elevations", () => {
    expect.hasAssertions();

    expect(getSkyGridDirections()).toHaveLength(432);
  });

  test("lays only unit vectors", () => {
    expect.hasAssertions();

    for (const direction of getSkyGridDirections()) expect(Math.hypot(...direction)).toBeCloseTo(1);
  });

  test("lays its elevations from 2 degrees up to 57, a step of 5 apart, and none above the 60 degree maximum", () => {
    expect.hasAssertions();

    const elevations = getSkyGridDirections().map(([, height]) => Math.round(MathUtils.radToDeg(Math.asin(height))));

    expect([...new Set(elevations)]).toStrictEqual([2, 7, 12, 17, 22, 27, 32, 37, 42, 47, 52, 57]);
  });
});
