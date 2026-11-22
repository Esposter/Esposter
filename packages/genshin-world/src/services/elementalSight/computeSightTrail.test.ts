import { computeSightTrail } from "#src/services/elementalSight/computeSightTrail";
import { SIGHT_REACH, SIGHT_TRAIL_POINT_CAPACITY, SIGHT_TRAIL_STEP } from "#src/services/elementalSight/constants";
import { describe, expect, test } from "vitest";

const getGroundHeight = (x: number, z: number) => x + z;
const createPoints = () => new Float32Array(SIGHT_TRAIL_POINT_CAPACITY * 3);

describe(computeSightTrail, () => {
  const ORIGIN = { x: 0, z: 0 };

  test("a trail runs from the origin to an end within the reach, a point every step along the ground", () => {
    expect.hasAssertions();

    const points = createPoints();
    const pointCount = computeSightTrail(ORIGIN, { x: 0, z: 2 * SIGHT_TRAIL_STEP }, getGroundHeight, points);

    expect(pointCount).toBe(3);
    expect(points.slice(0, pointCount * 3)).toStrictEqual(
      new Float32Array([0, 0, 0, 0, SIGHT_TRAIL_STEP, SIGHT_TRAIL_STEP, 0, 2 * SIGHT_TRAIL_STEP, 2 * SIGHT_TRAIL_STEP]),
    );
  });

  test("an end past the reach stops the trail at the reach", () => {
    expect.hasAssertions();

    const points = createPoints();
    const pointCount = computeSightTrail(ORIGIN, { x: 0, z: SIGHT_REACH + 1 }, getGroundHeight, points);

    expect(pointCount).toBe(SIGHT_REACH / SIGHT_TRAIL_STEP + 1);
    expect(points.slice((pointCount - 1) * 3, pointCount * 3)).toStrictEqual(
      new Float32Array([0, SIGHT_REACH, SIGHT_REACH]),
    );
  });

  test("a trail whose end is where the character stands draws nothing", () => {
    expect.hasAssertions();

    expect(computeSightTrail(ORIGIN, ORIGIN, getGroundHeight, createPoints())).toBe(0);
  });
});
