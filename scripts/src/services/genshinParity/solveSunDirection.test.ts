import { solveSunDirection } from "#src/services/genshinParity/solveSunDirection";
import { describe, expect, test } from "vitest";

describe(solveSunDirection, () => {
  test("recovers the direction that lit the faces", () => {
    expect.hasAssertions();

    const sun = [0.6, 0.6, 0] as const;
    const length = Math.hypot(...sun);
    const normals: [number, number, number][] = [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [0, 0, -1],
      [Math.SQRT1_2, Math.SQRT1_2, 0],
      [0, Math.SQRT1_2, Math.SQRT1_2],
    ];
    const samples = normals.map((normal) => ({
      brightness: 1 + Math.max(0, (normal[0] * sun[0] + normal[1] * sun[1] + normal[2] * sun[2]) / length),
      normal,
    }));
    const { elevation, heading } = solveSunDirection(samples);

    expect([Math.round(heading), Math.round(elevation)]).toStrictEqual([90, 45]);
  });
});
