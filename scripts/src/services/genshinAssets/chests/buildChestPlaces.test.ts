import { ChestKind } from "genshin-world/definitions";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinAssets/points/readFittedMapPoints"), () => ({
  readFittedMapPoints: () =>
    Promise.resolve({
      points: [{ area_id: 1, id: 1, label_id: 129, x_pos: 1.5, y_pos: 2.25, z_level: 0 }],
      regions: [],
      transform: { mirrored: false, offset: { x: 10, z: 20 }, scale: 1, turn: 0 },
    }),
}));
vi.mock(import("#src/services/genshinAssets/world/readWorldOrigin"), () => ({
  readWorldOrigin: () => Promise.resolve([0, 0, 0]),
}));

const { buildChestPlaces } = await import("#src/services/genshinAssets/chests/buildChestPlaces");

describe(buildChestPlaces, () => {
  test("a Mora chest stands at its marker in Mondstadt", async () => {
    expect.hasAssertions();

    const { objects } = await buildChestPlaces();

    // The marker sits at (11.5, -22.25) in Mondstadt's axes, as a point under an offset of (10, 20) does with no origin
    expect(objects["chests/mondstadt"]).toStrictEqual([
      { id: "chest-1", kind: ChestKind.WoodenMora, position: { x: 11.5, z: -22.25 } },
    ]);
  });
});
