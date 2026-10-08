import { RIVER_BEND_FOAM_ATTRIBUTE } from "#src/water/constants";
import { createRiverGeometry } from "#src/water/createRiverGeometry";
import { Box3 } from "three";
import { describe, expect, test } from "vitest";

describe(createRiverGeometry, () => {
  test("spans the water's width and level along the course, with v counting metres downstream", () => {
    expect.hasAssertions();

    const geometry = createRiverGeometry([
      { level: 2, width: 4, x: 0, z: 0 },
      { level: 2, width: 4, x: 10, z: 0 },
    ]);
    geometry.computeBoundingBox();
    const { max, min } = geometry.boundingBox ?? new Box3();
    const uvs = geometry.getAttribute("uv");

    expect({ max: max.toArray(), maxV: uvs.getY(uvs.count - 1), min: min.toArray() }).toStrictEqual({
      max: [10, 2, 2],
      maxV: 10,
      min: [0, 2, -2],
    });
  });

  test("gathers bend foam on the outer bank of a turn alone, and none along a straight", () => {
    expect.hasAssertions();

    const geometry = createRiverGeometry([
      { level: 0, width: 1, x: 0, z: 0 },
      { level: 0, width: 1, x: 1, z: 0 },
      { level: 0, width: 1, x: 2, z: 0 },
      { level: 0, width: 1, x: 2, z: 1 },
    ]);

    expect(Array.from(geometry.getAttribute(RIVER_BEND_FOAM_ATTRIBUTE).array)).toStrictEqual([0, 0, 0, 0, 1, 0, 0, 0]);
  });
});
