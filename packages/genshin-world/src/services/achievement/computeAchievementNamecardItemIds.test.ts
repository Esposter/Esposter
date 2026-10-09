import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementCategory } from "#src/models/achievement/AchievementCategory";

import { computeAchievementNamecardItemIds } from "#src/services/achievement/computeAchievementNamecardItemIds";
import { describe, expect, test } from "vitest";

describe(computeAchievementNamecardItemIds, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const FINISHED_CATEGORY_ID = 1;
  const HALF_FINISHED_CATEGORY_ID = 2;
  const NO_NAMECARD_CATEGORY_ID = 3;
  const FINISHED_NAMECARD_ITEM_ID = 210_021;
  const categories: AchievementCategory[] = [
    { id: FINISHED_CATEGORY_ID, namecardItemId: FINISHED_NAMECARD_ITEM_ID, nameTextId: "", orderId: 1 },
    { id: HALF_FINISHED_CATEGORY_ID, namecardItemId: 210_022, nameTextId: "", orderId: 2 },
    { id: NO_NAMECARD_CATEGORY_ID, namecardItemId: 0, nameTextId: "", orderId: 3 },
  ];
  const achievement: Achievement = {
    categoryId: FINISHED_CATEGORY_ID,
    descriptionTextId: "",
    id: 1,
    isHidden: false,
    orderId: 1,
    preStageAchievementId: 0,
    primogems: 0,
    progress: 1,
    titleTextId: "",
    trigger: { parameters: [], type: "TRIGGER_TALK_NUM" },
  };
  const achievements: Achievement[] = [
    achievement,
    { ...achievement, categoryId: FINISHED_CATEGORY_ID, id: 2 },
    { ...achievement, categoryId: HALF_FINISHED_CATEGORY_ID, id: 3 },
    { ...achievement, categoryId: HALF_FINISHED_CATEGORY_ID, id: 4 },
    { ...achievement, categoryId: NO_NAMECARD_CATEGORY_ID, id: 5 },
  ];
  const finished = { count: 1, finishedAt: EPOCH };

  test("should list the namecard only of a category with a namecard whose every achievement is finished", () => {
    expect.hasAssertions();
    expect(
      computeAchievementNamecardItemIds(
        categories,
        achievements,
        new Map([
          [1, finished],
          [2, finished],
          [3, finished],
          [5, finished],
        ]),
      ),
    ).toStrictEqual([FINISHED_NAMECARD_ITEM_ID]);
  });
});
