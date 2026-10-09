import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { describe, expect, test } from "vitest";

describe(placeMapPoints, () => {
  test("carries each ground point of a kind into its region's axes at the fit's place, and leaves out the rest", () => {
    expect.hasAssertions();
    // A point at (1.5, 2.25) under an offset of (10, 20) lands at (11.5, 22.25) in the game's coordinates.
    // An origin of (0, 0) leaves it at (11.5, -22.25) in the region's axes, its z mirrored
    const transform = { mirrored: false, offset: { x: 10, z: 20 }, scale: 1, turn: 0 };
    const placement = placeMapPoints(
      [
        { area_id: 1, id: 1, label_id: 17, x_pos: 1.5, y_pos: 2.25, z_level: 0 },
        { area_id: 1, id: 2, label_id: 69, x_pos: 1.5, y_pos: 2.25, z_level: 0 },
        { area_id: 1, id: 3, label_id: 17, x_pos: 1.5, y_pos: 2.25, z_level: 2 },
        { area_id: 5, id: 4, label_id: 17, x_pos: 1.5, y_pos: 2.25, z_level: 0 },
        { area_id: 1, id: 5, label_id: 2, x_pos: 1.5, y_pos: 2.25, z_level: 0 },
      ],
      transform,
      new Map([
        [17, "Common"],
        [69, "Buried"],
      ]),
      "chest",
      [0, 0, 0],
    );
    expect(placement).toStrictEqual({
      places: {
        mondstadt: [
          { id: "chest-1", kind: "Common", position: { x: 11.5, z: -22.25 } },
          { id: "chest-2", kind: "Buried", position: { x: 11.5, z: -22.25 } },
        ],
      },
      skippedUnderground: 1,
      skippedUnmapped: 1,
    });
  });

  test("carries a raw game point into the region frame round the Windrise origin, its z mirrored about the origin", () => {
    expect.hasAssertions();
    // The chest at (2342.42, -469.37) in the game's axes lies at (452.43, -797.48) in Mondstadt's region frame
    const transform = { mirrored: false, offset: { x: 0, z: 0 }, scale: 1, turn: 0 };
    const placement = placeMapPoints(
      [{ area_id: 1, id: 100_495, label_id: 17, x_pos: 2342.42, y_pos: -469.37, z_level: 0 }],
      transform,
      new Map([[17, "Common"]]),
      "chest",
      [1889.99, 0, -1266.85],
    );
    expect(placement.places).toStrictEqual({
      mondstadt: [{ id: "chest-100495", kind: "Common", position: { x: 452.43, z: -797.48 } }],
    });
  });
});
