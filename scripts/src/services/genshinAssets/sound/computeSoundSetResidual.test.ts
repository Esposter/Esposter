import { computeSoundSetResidual } from "#src/services/genshinAssets/sound/computeSoundSetResidual";
import { describe, expect, test } from "vitest";

describe(computeSoundSetResidual, () => {
  test("takes out one level over every band", () => {
    expect.hasAssertions();

    const window = [
      [1, 10],
      [10, 1],
    ];

    expect(
      computeSoundSetResidual(
        window,
        window.map((bands) => bands.map((power) => power * 2)),
        [0, 1],
      ),
    ).toBe(0);
  });

  test("leaves a balance between bands unexplained", () => {
    expect.hasAssertions();

    const window = [[1, 10]];

    expect(computeSoundSetResidual(window, [[10, 10]], [0, 1])).toBe(5);
  });
});
