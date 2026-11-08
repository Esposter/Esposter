import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";

import { toFittedPlants } from "#src/services/genshinAssets/fit/fitRegionPlants";
import { describe, expect, test } from "vitest";

const grass = (position: [number, number, number]): WorldPlacement => ({
  pathHash: "",
  position,
  prefabId: 1,
  radius: 0,
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
});

describe(toFittedPlants, () => {
  test("a region's grass stands where its plant record places it", () => {
    expect.hasAssertions();

    const [plant] = toFittedPlants([{ name: "Stages_SGrass12_Vo", places: [grass([150, 5, 260])] }], [100, 0, 200]);
    const places = plant?.places ?? [];

    // The game's x is ours, its z mirrored about the origin's, so the place is 50 east and 60 north of the origin
    expect(places.map(({ position, scale }) => ({ position, scale }))).toStrictEqual([
      { position: { x: 50, z: -60 }, scale: [1, 1, 1] },
    ]);
    expect(places.map(({ rotation }) => typeof rotation)).toStrictEqual(["number"]);
  });
});
