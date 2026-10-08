import { createWaterfallGeometry } from "#src/water/createWaterfallGeometry";
import { Box3, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createWaterfallGeometry, () => {
  test("hangs its width across the lip and drops its height from it", () => {
    expect.hasAssertions();

    const geometry = createWaterfallGeometry({
      across: new Vector3(0, 0, 1),
      drop: 5,
      lip: new Vector3(1, 8, 0),
      width: 2,
    });
    geometry.computeBoundingBox();
    const { max, min } = geometry.boundingBox ?? new Box3();

    expect({ max: max.toArray(), min: min.toArray() }).toStrictEqual({ max: [1, 8, 1], min: [1, 3, -1] });
  });
});
