import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";

import { selectFinestLevels } from "#src/services/genshinAssets/selectFinestLevels";
import { describe, expect, test } from "vitest";

const createPlacement = (mesh: string): AssetPlacement => ({
  materials: [],
  mesh,
  name: mesh,
  position: [0, 0, 0],
  root: "",
  rotation: [0, 0, 0, 1],
  scale: [1, 1, 1],
});

describe(selectFinestLevels, () => {
  test("keeps each part's finest exported level and every exported mesh without levels", () => {
    expect.hasAssertions();

    const exported = new Set(["Arch_Lod0", "Door", "Tower_Lod1", "Tower_Lod2"]);
    const placements = ["Tower_Lod0", "Tower_Lod1", "Tower_Lod2", "Door", "Lamp", "Arch_Lod0"].map((mesh) =>
      createPlacement(mesh),
    );

    expect(selectFinestLevels(placements, (mesh) => exported.has(mesh)).map(({ mesh }) => mesh)).toStrictEqual([
      "Tower_Lod1",
      "Door",
      "Arch_Lod0",
    ]);
  });
});
