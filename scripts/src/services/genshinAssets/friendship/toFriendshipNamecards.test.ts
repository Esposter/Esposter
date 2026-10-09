import type { ExcelFetterCharacterCardRow } from "#src/models/genshinAssets/friendship/ExcelFetterCharacterCardRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { toFriendshipNamecards } from "#src/services/genshinAssets/friendship/toFriendshipNamecards";
import { describe, expect, test } from "vitest";

describe(toFriendshipNamecards, () => {
  const AVATAR_ID = 10000021;
  const REWARD_ID = 241001;
  const ITEM_ID = 210003;
  const NAME_TEXT_ID = 273889772;
  const MATERIAL_ROW = {
    foodQuality: "FOOD_QUALITY_NONE",
    id: ITEM_ID,
    itemUse: [],
    materialType: "MATERIAL_NAMECARD",
    nameTextMapHash: NAME_TEXT_ID,
    rank: 0,
    rankLevel: 0,
    stackLimit: 1,
  } satisfies MaterialRow;
  const REWARD_ROW = {
    rewardId: REWARD_ID,
    rewardItemList: [
      { itemCount: 1, itemId: ITEM_ID },
      { itemCount: 0, itemId: 0 },
    ],
  } satisfies ExcelRewardRow;

  test("should join a level 10 card to its reward's item and name it by that item's text id, leaving other levels out", () => {
    expect.hasAssertions();

    const cardRows: ExcelFetterCharacterCardRow[] = [
      { avatarId: AVATAR_ID, fetterLevel: 10, rewardId: REWARD_ID },
      { avatarId: AVATAR_ID, fetterLevel: 9, rewardId: REWARD_ID },
    ];

    expect(toFriendshipNamecards(cardRows, new Map([[REWARD_ID, REWARD_ROW]]), [MATERIAL_ROW])).toStrictEqual([
      { characterId: AVATAR_ID, itemId: ITEM_ID, nameTextId: NAME_TEXT_ID },
    ]);
  });

  test("should throw where a level 10 reward's item is no namecard", () => {
    expect.hasAssertions();

    const cardRows: ExcelFetterCharacterCardRow[] = [{ avatarId: AVATAR_ID, fetterLevel: 10, rewardId: REWARD_ID }];

    expect(() =>
      toFriendshipNamecards(cardRows, new Map([[REWARD_ID, REWARD_ROW]]), [
        { ...MATERIAL_ROW, materialType: "MATERIAL_CONSUME" },
      ]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 210003, is no namecard in the material table]`,
    );
  });
});
