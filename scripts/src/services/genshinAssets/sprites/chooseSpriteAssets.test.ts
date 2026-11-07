import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { chooseSpriteAssets } from "#src/services/genshinAssets/sprites/chooseSpriteAssets";
import { describe, expect, test } from "vitest";

describe(chooseSpriteAssets, () => {
  const FIXTURE_ASSETS: IndexedAsset[] = [
    { block: "00/11790361.blk", name: "UI_AimCrossB_00", offset: 0, pathId: "1", type: "Texture2D" },
    { block: "00/11790361.blk", name: "UI_AimCrossB_00", offset: 1, pathId: "2", type: "Sprite" },
    { block: "00/08466595.blk", name: "UI_TouchIcon_Story", offset: 2, pathId: "3", type: "Sprite" },
  ];

  test("chooses a name's sprite over its texture, and names the ones the index holds neither of", () => {
    expect.hasAssertions();

    expect(chooseSpriteAssets(["UI_AimCrossB_00", "Nowhere", "UI_TouchIcon_Story"], FIXTURE_ASSETS)).toStrictEqual({
      assets: [FIXTURE_ASSETS[1], FIXTURE_ASSETS[2]],
      missing: ["Nowhere"],
    });
  });
});
