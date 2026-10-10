import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { checkNamecardAsset } from "#src/services/genshinAssets/namecards/checkNamecardAsset";
import { describe, expect, test } from "vitest";

describe(checkNamecardAsset, () => {
  const BLOCK = "00/14691532.blk";
  const PATH_ID = "7150199236348243771";

  test.each([
    [true, "a card art's texture", "UI_NameCardPic_Bp40_P", AssetType.Texture2D],
    [true, "an icon's texture", "UI_NameCardIcon_Furina", AssetType.Texture2D],
    [false, "a card art's sprite, the texture's cut", "UI_NameCardPic_Bp40_P", "Sprite"],
    [false, "an avatar icon's texture", "UI_AvatarIcon_Furina_Circle", AssetType.Texture2D],
  ])("should return %s for %s", (expected, _description, name, type) => {
    expect.hasAssertions();

    expect(checkNamecardAsset({ block: BLOCK, name, offset: 0, pathId: PATH_ID, type })).toBe(expected);
  });
});
