import type { SceneLayout } from "genshin-engine";

import { toHullPlacements } from "#src/services/genshinAssets/fit/fitRegionHulls";
import { checkIsRockMesh } from "#src/services/genshinAssets/fit/fitRegionRocks";
import { checkIsRuinMesh } from "#src/services/genshinAssets/fit/fitRegionRuins";
import { describe, expect, test } from "vitest";

type WitnessPlacement = SceneLayout["placements"][number];

const witness = (mesh: string, position: [number, number, number]): WitnessPlacement => ({
  materials: [],
  mesh,
  position,
  rotation: [0, 0, 0, 1],
  scale: [1, 1, 1],
});

describe(toHullPlacements, () => {
  test("a rock stands at its placed position", () => {
    expect.hasAssertions();

    expect(
      toHullPlacements([witness("Area_Dq_Rock_Common_Full_M_07_Lod0", [10, 2, -5])], checkIsRockMesh),
    ).toStrictEqual([
      { hull: "Area_Dq_Rock_Common_Full_M_07_Lod0", position: [10, 2, -5], rotation: [0, 0, 0, 1], scale: [1, 1, 1] },
    ]);
  });

  test("a rock the game does not place is not drawn", () => {
    expect.hasAssertions();

    expect(
      toHullPlacements(
        [
          witness("Area_Common_Build_RockWall_A_01_Lod0", [0, 0, 0]),
          witness("Area_Common_Build_RockRoad_A_02_Lod0", [0, 0, 0]),
          witness("Area_Dq_Light_Common_Stonelamp_01_Vo", [0, 0, 0]),
          witness("Area_Dq_Stone_Common_Full_S_14_ShadowMesh", [0, 0, 0]),
          witness("Area_Dq_Tree_Common_Sak_01_Bark_Lod0", [0, 0, 0]),
        ],
        checkIsRockMesh,
      ),
    ).toStrictEqual([]);
  });

  test("a ruin stands at its placed position", () => {
    expect.hasAssertions();

    expect(toHullPlacements([witness("Area_Common_Build_Ruin_G_01_Lod0", [10, 2, -5])], checkIsRuinMesh)).toStrictEqual(
      [{ hull: "Area_Common_Build_Ruin_G_01_Lod0", position: [10, 2, -5], rotation: [0, 0, 0, 1], scale: [1, 1, 1] }],
    );
  });

  test("a ruin the game does not place is not drawn", () => {
    expect.hasAssertions();

    expect(
      toHullPlacements(
        [
          witness("Area_Common_Build_Ruin_G_01_ShadowMesh", [0, 0, 0]),
          witness("Area_Common_Build_RockWall_A_01_Lod0", [0, 0, 0]),
          witness("Area_Xm_Build_XKC_Comp_Lowhouse_01_Lod0", [0, 0, 0]),
        ],
        checkIsRuinMesh,
      ),
    ).toStrictEqual([]);
  });
});
