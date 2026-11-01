import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { NAMECARD_MATERIAL_TYPE } from "#src/services/genshinAssets/profile/constants";
import { getNamecardIconNameMap } from "#src/services/genshinAssets/profile/getNamecardIconNameMap";
import { InvalidOperationError } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getNamecardIconNameMap, () => {
  const AVATAR_ID = 1;
  const REWARD_ID = 2;
  const NAMECARD_ID = 3;
  const GIFT_ID = 4;
  const namecardMaterialRow = { icon: "icon", id: NAMECARD_ID, materialType: NAMECARD_MATERIAL_TYPE };
  const giftMaterialRow = { icon: " ", id: GIFT_ID, materialType: " " };
  const createRewardMap = (...itemIds: number[]): Map<number, ExcelRewardRow> =>
    new Map([
      [REWARD_ID, { rewardId: REWARD_ID, rewardItemList: itemIds.map((itemId) => ({ itemCount: 1, itemId })) }],
    ]);

  test("names a character's namecard by the icon of the namecard its card's reward pays", () => {
    expect.hasAssertions();

    expect(
      getNamecardIconNameMap([{ avatarId: AVATAR_ID, rewardId: REWARD_ID }], createRewardMap(GIFT_ID, NAMECARD_ID), [
        giftMaterialRow,
        namecardMaterialRow,
      ]),
    ).toStrictEqual(new Map([[AVATAR_ID, "icon"]]));
  });

  test("gives no namecard to a character whose card pays none, or that has no card", () => {
    expect.hasAssertions();

    expect(
      getNamecardIconNameMap([{ avatarId: AVATAR_ID, rewardId: REWARD_ID }], createRewardMap(GIFT_ID), [
        giftMaterialRow,
        namecardMaterialRow,
      ]).size,
    ).toBe(0);
    expect(getNamecardIconNameMap([], createRewardMap(NAMECARD_ID), [namecardMaterialRow]).size).toBe(0);
  });

  test("refuses a character paid two namecards", () => {
    expect.hasAssertions();

    expect(() =>
      getNamecardIconNameMap([{ avatarId: AVATAR_ID, rewardId: REWARD_ID }], createRewardMap(NAMECARD_ID, GIFT_ID), [
        namecardMaterialRow,
        { ...giftMaterialRow, materialType: NAMECARD_MATERIAL_TYPE },
      ]),
    ).toThrow(InvalidOperationError);
  });
});
