import { placeCloudBand } from "#src/atmosphere/placeCloudBand";
import { describe, expect, test } from "vitest";

describe(placeCloudBand, () => {
  const options = {
    count: 64,
    distanceRange: [10, 20] as [number, number],
    heightRange: [1, 2] as [number, number],
    seed: 0,
    widthRange: [3, 4] as [number, number],
  };

  test("keeps every cloud within its band's distances, heights and widths", () => {
    expect.hasAssertions();

    const clouds = placeCloudBand(options, 8);

    expect(
      clouds.every(
        ({ position: [x, y, z], spriteIndex, width }) =>
          Math.hypot(x, z) >= 10 &&
          Math.hypot(x, z) <= 20 &&
          y >= 1 &&
          y <= 2 &&
          width >= 3 &&
          width <= 4 &&
          spriteIndex < 8,
      ),
    ).toBe(true);
  });
});
