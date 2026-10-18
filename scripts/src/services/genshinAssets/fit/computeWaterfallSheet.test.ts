import { computeWaterfallSheet } from "#src/services/genshinAssets/fit/computeWaterfallSheet";
import { Quaternion, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(computeWaterfallSheet, () => {
  test("hangs its width across the lip and drops its height from it, wherever the quad turns", () => {
    expect.hasAssertions();

    const turn = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
    const quad = [new Vector3(-1, 0, 0), new Vector3(1, 0, 0), new Vector3(-1, -10, 0), new Vector3(1, -10, 0)].map(
      (point) => point.applyQuaternion(turn),
    );

    expect(computeWaterfallSheet(quad)).toStrictEqual({
      across: { x: 0, y: 0, z: 1 },
      drop: 10,
      lip: { x: 0, y: 0, z: 0 },
      width: 2,
    });
  });

  test("has no sheet for a lip with no width, as a fall whose vertices stand over one point has no direction across it", () => {
    expect.hasAssertions();

    expect(computeWaterfallSheet([new Vector3(0, 5, 0), new Vector3(0, 0, 0)])).toBeUndefined();
  });
});
