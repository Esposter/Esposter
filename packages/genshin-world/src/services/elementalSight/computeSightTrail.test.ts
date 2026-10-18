import { computeSightTrail } from "#src/services/elementalSight/computeSightTrail";
import { SIGHT_REACH, SIGHT_TRAIL_STEP } from "#src/services/elementalSight/constants";
import { describe, expect, test } from "vitest";

const getGroundHeight = (x: number, z: number) => x + z;

describe(computeSightTrail, () => {
  const ORIGIN = { x: 0, z: 0 };

  test("a trail runs from the origin to an end within the reach, a point every step along the ground", () => {
    expect.hasAssertions();

    expect(computeSightTrail(ORIGIN, { x: 0, z: 2 * SIGHT_TRAIL_STEP }, getGroundHeight)).toStrictEqual([
      { x: 0, y: 0, z: 0 },
      { x: 0, y: SIGHT_TRAIL_STEP, z: SIGHT_TRAIL_STEP },
      { x: 0, y: 2 * SIGHT_TRAIL_STEP, z: 2 * SIGHT_TRAIL_STEP },
    ]);
  });

  test("an end past the reach stops the trail at the reach", () => {
    expect.hasAssertions();

    const trail = computeSightTrail(ORIGIN, { x: 0, z: SIGHT_REACH + 1 }, getGroundHeight);
    expect(trail).toHaveLength(SIGHT_REACH / SIGHT_TRAIL_STEP + 1);
    expect(trail.at(-1)).toStrictEqual({ x: 0, y: SIGHT_REACH, z: SIGHT_REACH });
  });

  test("a trail whose end is where the character stands draws nothing", () => {
    expect.hasAssertions();

    expect(computeSightTrail(ORIGIN, ORIGIN, getGroundHeight)).toStrictEqual([]);
  });
});
