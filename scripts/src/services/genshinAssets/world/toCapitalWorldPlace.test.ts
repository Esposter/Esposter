import { toCapitalWorldPlace } from "#src/services/genshinAssets/world/toCapitalWorldPlace";
import { describe, expect, test } from "vitest";

describe(toCapitalWorldPlace, () => {
  test("places a region's point in the game's axes, its z mirrored", () => {
    expect.hasAssertions();

    expect(toCapitalWorldPlace({ x: 2, z: -4 }, [10, 0, 20])).toStrictEqual({ x: 12, z: 24 });
  });
});
