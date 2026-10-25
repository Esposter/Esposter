import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { describe, expect, test } from "vitest";

describe("derived asset component map", () => {
  test("roots the player's girl at her model prefab in the block the animator reads", () => {
    expect.hasAssertions();

    expect(DerivedAssetComponentMap[DerivedAssetComponent.PlayerGirl].roots).toStrictEqual([
      { block: "00/02666572.blk", name: "Avatar_Girl_Sword_PlayerGirl_Model", pathId: "7275937277578795946" },
    ]);
  });

  test("A streamed object stands where the game places it", () => {
    expect.hasAssertions();

    const streamedPrefabs =
      DerivedAssetComponentMap[DerivedAssetComponent.Windrise].world?.streams.flatMap(({ prefabs }) => prefabs) ?? [];

    expect(streamedPrefabs).toContainEqual({
      prefab: { block: "00/05652564.blk", name: "Area_Common_Build_Plinth_E_01_Lod0", pathId: "-2383471818772636885" },
      prefabId: 2_068_799_372,
    });
    expect(streamedPrefabs).toContainEqual({
      prefab: { block: "00/05652564.blk", name: "Area_Common_Build_Plinth_E_02_Lod0", pathId: "-4253360323365887065" },
      prefabId: 2_068_796_237,
    });
  });

  test("The dais in Windrise stands at its place", () => {
    expect.hasAssertions();

    const streamedPrefabs =
      DerivedAssetComponentMap[DerivedAssetComponent.Windrise].world?.streams.flatMap(({ prefabs }) => prefabs) ?? [];

    expect(streamedPrefabs).toContainEqual({
      prefab: { block: "00/03851813.blk", name: "Area_Common_Build_Stair_A_01_Lod0", pathId: "-3545738691652725999" },
      prefabId: 2_751_255_372,
    });
  });
});
