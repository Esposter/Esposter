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
});
