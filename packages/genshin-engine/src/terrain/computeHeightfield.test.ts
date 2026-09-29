import { computeHeightfield } from "#src/terrain/computeHeightfield";
import { describe, expect, test } from "vitest";

// Records each vertex's slope in its red channel, so a test reads the slope the grid computed
const writeSlope = (colors: Float32Array, offset: number, _height: number, slope: number) => {
  colors[offset] = slope;
};

describe(computeHeightfield, () => {
  const resolution = 2;
  const size = 2;

  test("lays a flat grid facing up, wound counter-clockwise from above", () => {
    expect.hasAssertions();

    expect(computeHeightfield({ getHeight: () => 0, resolution, size, writeColor: writeSlope })).toStrictEqual({
      colors: new Float32Array(12),
      indices: Uint32Array.from([0, 2, 1, 1, 2, 3]),
      normals: Float32Array.from([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]),
      positions: Float32Array.from([-1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, 1]),
    });
  });

  test("tilts normals away from rising ground and reports the slope", () => {
    expect.hasAssertions();

    const { colors, normals } = computeHeightfield({ getHeight: (x) => x, resolution, size, writeColor: writeSlope });
    const length = Math.hypot(2, 4);

    expect(normals.subarray(0, 3)).toStrictEqual(Float32Array.from([-2 / length, 4 / length, 0]));
    expect(colors[0]).toBe(Math.fround(1 - 4 / length));
  });
});
