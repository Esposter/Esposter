import { computeNormalMapAngles } from "#src/services/genshinParity/passes/computeNormalMapAngles";
import { SPLIT_BLOCK_PIXELS } from "#src/services/genshinParity/passes/constants";
import { describe, expect, test } from "vitest";

describe(computeNormalMapAngles, () => {
  test("reads the bend over a family's pixels and over each half of its blocks", () => {
    expect.hasAssertions();

    // One row two blocks wide: the first block's maps bend nothing, the second's turn each normal a right angle
    const width = SPLIT_BLOCK_PIXELS * 2;
    const toTarget = (toPixel: (pixel: number) => number[]): Float32Array =>
      Float32Array.from(Array.from({ length: width }, (_value, pixel) => toPixel(pixel)).flat());
    const normal = toTarget(() => [0, 1, 0, 1]);
    const geometryNormal = toTarget((pixel) => (pixel < SPLIT_BLOCK_PIXELS ? [0, 1, 0, 1] : [0, 0, 1, 1]));
    const part = toTarget(() => [1, 0, 0, 1]);

    expect(computeNormalMapAngles(normal, geometryNormal, part, width, 2)).toStrictEqual([
      { angle: 45, family: 0, halves: [0, 90] },
    ]);
  });
});
