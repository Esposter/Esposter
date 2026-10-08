import { fitPavingStoneShape } from "#src/services/genshinAssets/fit/fitPavingStoneShape";
import { describe, expect, test } from "vitest";

describe(fitPavingStoneShape, () => {
  test("reads a square's radii from its edges and its corners, and its heights from its vertices", () => {
    expect.hasAssertions();

    const { bottom, radii, top } = fitPavingStoneShape([
      [1, 0, 1],
      [-1, 0, 1],
      [-1, 0.2, -1],
      [1, 0.2, -1],
      [0, 0.1, 0],
    ]);
    const cornerSide = radii.length / 8;

    expect(bottom).toBe(0);
    expect(top).toBe(0.2);
    expect(radii[0]).toBe(1);
    expect(radii[cornerSide]).toBeCloseTo(Math.SQRT2, 2);
  });
});
