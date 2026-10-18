import type { ExcelExpeditionDataRow } from "#src/models/genshinAssets/expeditions/ExcelExpeditionDataRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";

import { toExpeditionPlaceRow } from "#src/services/genshinAssets/expeditions/toExpeditionPlaceRow";
import { OPEN_WORLD_SCENE_ID } from "#src/services/genshinAssets/shared/constants";
import { describe, expect, test } from "vitest";

describe(toExpeditionPlaceRow, () => {
  const PLACE_ID = 101;
  const NAME_TEXT_HASH = 2_498_537_973;
  const RANK_LEVEL = 14;
  const STATUE_POINT_ID = 7;
  const REWARD_PREVIEW_ID = 1011;
  const ITEM_ID = 101_001;
  const HOURS = 4;
  const previews = new Map<number, ExcelRewardPreviewRow>([
    [
      REWARD_PREVIEW_ID,
      {
        id: REWARD_PREVIEW_ID,
        previewItems: [
          { count: "4;5", id: ITEM_ID },
          { count: "", id: 0 },
        ],
      },
    ],
  ]);
  const row: ExcelExpeditionDataRow = {
    MOOEHHLEOOB: [
      { AOCOBPPBOOL: RANK_LEVEL, OLDPDBIPNHD: 0, type: "EXP_OPEN_COND_LEVEL" },
      { AOCOBPPBOOL: STATUE_POINT_ID, OLDPDBIPNHD: OPEN_WORLD_SCENE_ID, type: "EXP_OPEN_COND_POINT" },
      { AOCOBPPBOOL: 0, OLDPDBIPNHD: 0, type: "EXP_OPEN_COND_LEVEL" },
    ],
    cityId: 1,
    PLLAFKOKDDE: [{ AMICCHBIALF: HOURS, AEJAMHLHEIE: 205_010_100, rewardPreview: REWARD_PREVIEW_ID }],
    id: PLACE_ID,
    nameTextMapHash: NAME_TEXT_HASH,
  };

  test("should read the rank, statue and durations of a place with its reward preview's items", () => {
    expect.hasAssertions();
    expect(toExpeditionPlaceRow(row, previews)).toStrictEqual({
      durations: [{ hours: HOURS, items: [{ itemId: ITEM_ID, maxCount: 5, minCount: 4 }] }],
      id: PLACE_ID,
      nameTextId: String(NAME_TEXT_HASH),
      questId: "",
      rankLevel: RANK_LEVEL,
      statuePointId: STATUE_POINT_ID,
    });
  });

  test("should read a rank condition the dump leaves untyped as the rank", () => {
    expect.hasAssertions();
    const untypedRow: ExcelExpeditionDataRow = { ...row, MOOEHHLEOOB: [{ AOCOBPPBOOL: RANK_LEVEL, OLDPDBIPNHD: 0 }] };
    expect(toExpeditionPlaceRow(untypedRow, previews).rankLevel).toBe(RANK_LEVEL);
  });

  test("should refuse a statue named in another scene", () => {
    expect.hasAssertions();
    const otherSceneRow: ExcelExpeditionDataRow = {
      ...row,
      MOOEHHLEOOB: [{ AOCOBPPBOOL: STATUE_POINT_ID, OLDPDBIPNHD: 4, type: "EXP_OPEN_COND_POINT" }],
    };
    expect(() => toExpeditionPlaceRow(otherSceneRow, previews)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 101, names a point in scene 4]`,
    );
  });
});
