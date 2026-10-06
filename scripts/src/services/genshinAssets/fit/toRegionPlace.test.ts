import { toRegionPlace } from "#src/services/genshinAssets/fit/toRegionPlace";
import { describe, expect, test } from "vitest";

describe(toRegionPlace, () => {
  test("mirrors z round the origin and reverses the turn about the vertical", () => {
    expect.hasAssertions();

    expect(
      toRegionPlace({ position: [2, 1, 1], rotation: [0, Math.SQRT1_2, 0, Math.SQRT1_2] }, [1, 1, 0]),
    ).toStrictEqual({ position: { x: 1, z: -1 }, rotation: -1.5708 });
  });
});
