import type { Vector } from "#src/models/shared/Vector";

import { computeDominantColour } from "#src/services/genshinAssets/palette/computeDominantColour";
import { describe, expect, test } from "vitest";

describe(computeDominantColour, () => {
  test("takes the mean and scatter of the largest cluster of linear texels", () => {
    expect.hasAssertions();

    // Five grey texels seeded at 0.125, 0.25, 0.5 and 1 under four clusters: 0.25 and 0.375 share the largest one
    // Of two texels, whose mean is 0.3125 and whose scatter is 0.0625 each side of it
    const texels: Vector[] = [
      [0.125, 0.125, 0.125],
      [0.25, 0.25, 0.25],
      [0.375, 0.375, 0.375],
      [0.5, 0.5, 0.5],
      [1, 1, 1],
    ];

    expect(computeDominantColour(texels)).toStrictEqual({
      linear: [0.3125, 0.3125, 0.3125],
      spread: 0.0625,
      texelCount: 2,
    });
  });
});
