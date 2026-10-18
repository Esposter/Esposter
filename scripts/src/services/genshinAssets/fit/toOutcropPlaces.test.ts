import { toOutcropPlaces } from "#src/services/genshinAssets/fit/toOutcropPlaces";
import { describe, expect, test } from "vitest";

describe(toOutcropPlaces, () => {
  test("carries each ground Ley Line Blossom point of the area into its region's axes, and leaves out the rest", () => {
    expect.hasAssertions();
    // A point at (1.5, 2.25) under an offset of (10, 20) lands at (11.5, 22.25) in the game's coordinates.
    // An origin of (0, 0) leaves it at (11.5, -22.25) in the region's axes, its z mirrored
    const transform = { mirrored: false, offset: { x: 10, z: 20 }, scale: 1, turn: 0 };
    const places = toOutcropPlaces({
      areaId: 1,
      mapPoints: [
        { area_id: 1, id: 1, label_id: 572, x_pos: 1.5, y_pos: 2.25, z_level: 0 },
        { area_id: 1, id: 2, label_id: 3, x_pos: 1.5, y_pos: 2.25, z_level: 0 },
        { area_id: 1, id: 3, label_id: 572, x_pos: 1.5, y_pos: 2.25, z_level: 2 },
        { area_id: 5, id: 4, label_id: 572, x_pos: 1.5, y_pos: 2.25, z_level: 0 },
      ],
      origin: [0, 0, 0],
      transform,
    });

    expect(places).toStrictEqual([{ id: 1, position: { x: 11.5, z: -22.25 } }]);
  });
});
