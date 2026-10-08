import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";

import { getPrefabNames } from "#src/services/genshinAssets/world/getPrefabNames";
import { describe, expect, test } from "vitest";

const createPlacement = (prefabId: number, pathHash: string): WorldPlacement => ({
  pathHash,
  position: [0, 0, 0],
  prefabId,
  radius: 0,
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
});

describe(getPrefabNames, () => {
  test("names each prefab by the last segment of its path, from the first placement of it the index names", () => {
    expect.hasAssertions();

    const pathNames = new Map([
      ["1", "ART/Stages/Area/Mengde/Props/Area_MdProps_Flower03_Vo"],
      ["2", "ART/Stages/Common/Rock/Stages_MDSRock11_Vo"],
    ]);

    expect(
      getPrefabNames([createPlacement(10, "3"), createPlacement(10, "1"), createPlacement(20, "2")], pathNames),
    ).toStrictEqual(
      new Map([
        [10, "Area_MdProps_Flower03_Vo"],
        [20, "Stages_MDSRock11_Vo"],
      ]),
    );
  });
});
