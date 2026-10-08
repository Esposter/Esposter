import { placeChests } from "#src/services/genshinAssets/chests/placeChests";
import { describe, expect, test } from "vitest";

describe(placeChests, () => {
  test("carries each ground chest into its region at the fit's place, and leaves out the rest", () => {
    expect.hasAssertions();
    // A point at (1.5, 2.25) under an offset of (10, 20) lands at (11.5, 22.25) in the game's coordinates
    const transform = { mirrored: false, offset: { x: 10, z: 20 }, scale: 1, turn: 0 };
    const placement = placeChests(
      [
        { area_id: 1, label_id: 17, x_pos: 1.5, y_pos: 2.25, z_level: 0, id: 1 },
        { area_id: 1, label_id: 69, x_pos: 1.5, y_pos: 2.25, z_level: 0, id: 2 },
        { area_id: 1, label_id: 17, x_pos: 1.5, y_pos: 2.25, z_level: 2, id: 3 },
        { area_id: 5, label_id: 17, x_pos: 1.5, y_pos: 2.25, z_level: 0, id: 4 },
        { area_id: 1, label_id: 2, x_pos: 1.5, y_pos: 2.25, z_level: 0, id: 5 },
      ],
      transform,
    );
    expect(placement).toStrictEqual({
      places: {
        mondstadt: [
          { id: "chest-1", kind: "Common", position: { x: 11.5, z: 22.25 } },
          { id: "chest-2", kind: "Buried", position: { x: 11.5, z: 22.25 } },
        ],
      },
      skippedUnderground: 1,
      skippedUnmapped: 1,
    });
  });
});
