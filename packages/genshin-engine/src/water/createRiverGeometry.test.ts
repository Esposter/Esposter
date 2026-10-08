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
});
