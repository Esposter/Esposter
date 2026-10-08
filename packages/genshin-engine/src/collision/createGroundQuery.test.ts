import { createGroundQuery } from "#src/collision/createGroundQuery";
import { describe, expect, test } from "vitest";

describe(createGroundQuery, () => {
  const WATER_LEVEL = 3;

  test("reads a flat ground straight up, at its height", () => {
    expect.hasAssertions();

    const { getGround } = createGroundQuery(() => 2, WATER_LEVEL);
    const { height, normal } = getGround(0, 0);

    expect(height).toBe(2);
    expect(normal.x).toBeCloseTo(0, 9);
    expect(normal.y).toBe(1);
    expect(normal.z).toBeCloseTo(0, 9);
  });

  test("tilts the normal against a slope's rise", () => {
    expect.hasAssertions();

    const { getGround } = createGroundQuery((x) => x, WATER_LEVEL);
    const { normal } = getGround(0, 0);

    expect(normal.x).toBeCloseTo(-1 / Math.SQRT2, 9);
    expect(normal.y).toBeCloseTo(1 / Math.SQRT2, 9);
    expect(normal.z).toBeCloseTo(0, 9);
  });

  test("reports the water's surface it was given", () => {
    expect.hasAssertions();

    expect(createGroundQuery(() => 0, WATER_LEVEL).getWaterLevel()).toBe(WATER_LEVEL);
  });
});
