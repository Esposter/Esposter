import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementCategory } from "#src/models/achievement/AchievementCategory";
import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";

import { computeProfileNamecardItemIds } from "#src/services/profile/computeProfileNamecardItemIds";
import { describe, expect, test } from "vitest";

describe(computeProfileNamecardItemIds, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const FINISHED_CATEGORY_ID = 1;
  const HALF_FINISHED_CATEGORY_ID = 2;
  const FINISHED_NAMECARD_ITEM_ID = 210_021;
  const HALF_FINISHED_NAMECARD_ITEM_ID = 210_022;
  const categories: AchievementCategory[] = [
    { id: FINISHED_CATEGORY_ID, namecardItemId: FINISHED_NAMECARD_ITEM_ID, nameTextId: "", orderId: 1 },
    { id: HALF_FINISHED_CATEGORY_ID, namecardItemId: HALF_FINISHED_NAMECARD_ITEM_ID, nameTextId: "", orderId: 2 },
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
    { ...achievement, id: 2 },
    { ...achievement, categoryId: HALF_FINISHED_CATEGORY_ID, id: 3 },
    { ...achievement, categoryId: HALF_FINISHED_CATEGORY_ID, id: 4 },
  ];
  const finished: AchievementProgress = { count: 1, finishedAt: EPOCH };
  const compute = (progressMap: ReadonlyMap<number, AchievementProgress>) =>
    computeProfileNamecardItemIds({
      achievements,
      categories,
      characters: [],
      friendshipLevels: [],
      friendshipNamecards: [],
      progressMap,
    });

  test("a finished category adds its namecard to the profile", () => {
    expect.hasAssertions();

    expect(
      compute(
        new Map([
          [1, finished],
          [2, finished],
        ]),
      ),
    ).toStrictEqual([FINISHED_NAMECARD_ITEM_ID]);
  });

  test("an unfinished category adds no namecard", () => {
    expect.hasAssertions();

    expect(compute(new Map([[3, finished]]))).toStrictEqual([]);
  });
});
