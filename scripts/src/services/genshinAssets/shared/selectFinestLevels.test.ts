import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { selectFinestLevels } from "#src/services/genshinAssets/shared/selectFinestLevels";
import { describe, expect, test } from "vitest";

const createPlacement = (mesh: string, father = "group"): AssetPlacement => ({
  father,
  materials: [],
  mesh,
  name: mesh,
  position: [0, 0, 0],
  root: "",
  rotation: [0, 0, 0, 1],
  scale: [1, 1, 1],
});

describe(selectFinestLevels, () => {
  test("keeps each object's finest exported level, a far object with only coarse levels too, and every exported mesh without levels", () => {
    expect.hasAssertions();

    const exported = new Set(["Arch_Lod0", "Door", "Tower_Lod1", "Tower_Lod2"]);
    const placements = [
      ...["Tower_Lod0", "Tower_Lod1", "Tower_Lod2", "Door", "Lamp", "Arch_Lod0"].map((mesh) => createPlacement(mesh)),
      createPlacement("Tower_Lod2", "farGroup"),
    ];

    expect(selectFinestLevels(placements, (mesh) => exported.has(mesh)).map(({ mesh }) => mesh)).toStrictEqual([
      "Tower_Lod1",
      "Door",
      "Arch_Lod0",
      "Tower_Lod2",
    ]);
  });
});
